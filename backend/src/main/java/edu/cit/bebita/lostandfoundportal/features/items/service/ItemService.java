package edu.cit.bebita.lostandfoundportal.features.items.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import edu.cit.bebita.lostandfoundportal.features.auth.dto.UserResponse;
import edu.cit.bebita.lostandfoundportal.features.auth.model.User;
import edu.cit.bebita.lostandfoundportal.features.auth.repository.UserRepository;
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

    public ItemService(ItemRepository itemRepository, UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
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

        Item updatedItem = itemRepository.save(item);
        return mapToItemResponse(updatedItem);
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