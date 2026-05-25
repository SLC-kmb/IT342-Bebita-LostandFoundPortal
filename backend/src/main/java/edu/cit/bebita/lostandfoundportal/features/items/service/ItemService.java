package edu.cit.bebita.lostandfoundportal.features.items.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import edu.cit.bebita.lostandfoundportal.features.auth.dto.UserResponse;
import edu.cit.bebita.lostandfoundportal.features.auth.model.User;
import edu.cit.bebita.lostandfoundportal.features.auth.repository.UserRepository;
import edu.cit.bebita.lostandfoundportal.features.auth.service.EmailService;
import edu.cit.bebita.lostandfoundportal.features.notifications.model.Notification;
import edu.cit.bebita.lostandfoundportal.features.notifications.dto.NotificationDto;
import edu.cit.bebita.lostandfoundportal.features.notifications.repository.NotificationRepository;
import edu.cit.bebita.lostandfoundportal.features.items.dto.ItemResponse;
import edu.cit.bebita.lostandfoundportal.features.items.dto.ReportFoundItemRequest;
import edu.cit.bebita.lostandfoundportal.features.items.dto.ReportLostItemRequest;
import edu.cit.bebita.lostandfoundportal.features.items.model.Item;
import edu.cit.bebita.lostandfoundportal.features.items.repository.ItemRepository;
import edu.cit.bebita.lostandfoundportal.shared.exception.ResourceNotFoundException;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    public ItemService(ItemRepository itemRepository, UserRepository userRepository, SimpMessagingTemplate messagingTemplate, EmailService emailService, NotificationRepository notificationRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.emailService = emailService;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public ItemResponse reportLostItem(ReportLostItemRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Item item = new Item();
        item.setItemName(request.getItemName());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setLocation(request.getLocation());
        item.setDateLost(request.getDateLost());
        item.setContactInfo(request.getContactInfo());
        item.setImageUrl(request.getImageUrl());
        item.setType("lost");
        item.setStatus("active");
        item.setReportedBy(user);

        Item savedItem = itemRepository.save(item);
        ItemResponse response = mapToItemResponse(savedItem);
        messagingTemplate.convertAndSend("/topic/items", response);
        return response;
    }

    @Transactional
    public ItemResponse reportFoundItem(ReportFoundItemRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Item item = new Item();
        item.setItemName(request.getItemName());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setLocation(request.getLocation());
        item.setDateFound(request.getDateFound());
        item.setContactInfo(request.getContactInfo());
        item.setImageUrl(request.getImageUrl());
        item.setType("found");
        item.setStatus("active");
        item.setReportedBy(user);
        Item savedItem = itemRepository.save(item);
        ItemResponse response = mapToItemResponse(savedItem);
        messagingTemplate.convertAndSend("/topic/items", response);
        return response;
    }

    public List<ItemResponse> getLostItems() {
        List<Item> items = itemRepository.findActiveItemsByType("lost");
        return items.stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());
    }

    public List<ItemResponse> getFoundItems() {
        List<Item> items = itemRepository.findActiveItemsByType("found");
        return items.stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());
    }

    public ItemResponse getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
        return mapToItemResponse(item);
    }

    @Transactional
    public ItemResponse claimItem(Long itemId, String userEmail) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!"active".equals(item.getStatus())) {
            throw new IllegalStateException("Item is not available for claiming");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        item.setStatus("pending_claim");
        item.setClaimedByUser(user);

        if ("lost".equals(item.getType()) && item.getReportedBy() != null) {
            String originalOwnerEmail = item.getReportedBy().getEmail();
            String originalOwnerName = item.getReportedBy().getFirstName();
            String finderName = user.getFirstName() + " " + user.getLastName();
            String finderEmail = user.getEmail();
            
            emailService.sendItemFoundEmail(originalOwnerEmail, finderName, finderEmail, item.getItemName(), originalOwnerName);

            // In-App Notification to the Finder
            String finderTitle = "Action Required: Return Found Item";
            String finderMessage = "If you found the item (" + item.getItemName() + "), please return it to the Admin Office so the owner can claim it.";
            
            Notification finderNotification = new Notification(user, finderTitle, finderMessage);
            Notification savedFinderNotif = notificationRepository.save(finderNotification);
            
            NotificationDto finderDto = new NotificationDto(savedFinderNotif.getId(), savedFinderNotif.getTitle(), savedFinderNotif.getMessage(), savedFinderNotif.isRead(), savedFinderNotif.getCreatedAt());
            String safeFinderEmail = user.getEmail().replaceAll("[@.]", "_");
            messagingTemplate.convertAndSend("/topic/notifications/" + safeFinderEmail, finderDto);

            // In-App Notification to the Original Owner
            String ownerTitle = "Your Lost Item Was Found!";
            String ownerMessage = "The item you reported as lost (" + item.getItemName() + ") has been found. Please wait for the admin to approve before claiming it at the admin office.";
            
            Notification ownerNotification = new Notification(item.getReportedBy(), ownerTitle, ownerMessage);
            Notification savedOwnerNotif = notificationRepository.save(ownerNotification);
            
            NotificationDto ownerDto = new NotificationDto(savedOwnerNotif.getId(), savedOwnerNotif.getTitle(), savedOwnerNotif.getMessage(), savedOwnerNotif.isRead(), savedOwnerNotif.getCreatedAt());
            String safeOwnerEmail = item.getReportedBy().getEmail().replaceAll("[@.]", "_");
            messagingTemplate.convertAndSend("/topic/notifications/" + safeOwnerEmail, ownerDto);
        }

        if ("found".equals(item.getType()) && item.getReportedBy() != null) {
            // In-App Notification to the Claimant (user)
            String claimantTitle = "Claim Request Submitted";
            String claimantMessage = "You have successfully requested to claim (" + item.getItemName() + "). Please proceed to the Admin Office with proof of ownership to verify and retrieve your item.";
            
            Notification claimantNotification = new Notification(user, claimantTitle, claimantMessage);
            Notification savedClaimantNotif = notificationRepository.save(claimantNotification);
            
            NotificationDto claimantDto = new NotificationDto(savedClaimantNotif.getId(), savedClaimantNotif.getTitle(), savedClaimantNotif.getMessage(), savedClaimantNotif.isRead(), savedClaimantNotif.getCreatedAt());
            String safeClaimantEmail = user.getEmail().replaceAll("[@.]", "_");
            messagingTemplate.convertAndSend("/topic/notifications/" + safeClaimantEmail, claimantDto);

            // In-App Notification to the Finder (item.getReportedBy())
            String finderTitle = "Someone is claiming your found item!";
            String finderMessage = "A user has submitted a claim for the item you found (" + item.getItemName() + "). The admin is currently verifying their ownership.";
            
            Notification finderNotification = new Notification(item.getReportedBy(), finderTitle, finderMessage);
            Notification savedFinderNotif = notificationRepository.save(finderNotification);
            
            NotificationDto finderDto = new NotificationDto(savedFinderNotif.getId(), savedFinderNotif.getTitle(), savedFinderNotif.getMessage(), savedFinderNotif.isRead(), savedFinderNotif.getCreatedAt());
            String safeFinderEmail = item.getReportedBy().getEmail().replaceAll("[@.]", "_");
            messagingTemplate.convertAndSend("/topic/notifications/" + safeFinderEmail, finderDto);
        }

        Item updatedItem = itemRepository.save(item);
        ItemResponse response = mapToItemResponse(updatedItem);
        messagingTemplate.convertAndSend("/topic/items", response);
        return response;
    }

    private ItemResponse mapToItemResponse(Item item) {
        ItemResponse response = new ItemResponse();
        response.setId(item.getId());
        response.setItemName(item.getItemName());
        response.setDescription(item.getDescription());
        response.setCategory(item.getCategory());
        response.setLocation(item.getLocation());
        response.setDateLost(item.getDateLost());
        response.setDateFound(item.getDateFound());
        response.setContactInfo(item.getContactInfo());
        response.setType(item.getType());
        response.setStatus(item.getStatus());
        response.setImageUrl(item.getImageUrl());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());

        if (item.getReportedBy() != null) {
            UserResponse reportedBy = new UserResponse(
                item.getReportedBy().getEmail(),
                item.getReportedBy().getFirstName(),
                item.getReportedBy().getLastName(),
                item.getReportedBy().getStudentId()
            );
            response.setReportedBy(reportedBy);
        }

        if (item.getClaimedByUser() != null) {
            UserResponse claimedBy = new UserResponse(
                item.getClaimedByUser().getEmail(),
                item.getClaimedByUser().getFirstName(),
                item.getClaimedByUser().getLastName(),
                item.getClaimedByUser().getStudentId()
            );
            response.setClaimedBy(claimedBy);
        }

        return response;
    }
}