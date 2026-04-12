package edu.cit.bebita.lostandfoundportal.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.bebita.lostandfoundportal.dto.ItemResponse;
import edu.cit.bebita.lostandfoundportal.dto.ReportFoundItemRequest;
import edu.cit.bebita.lostandfoundportal.dto.ReportLostItemRequest;
import edu.cit.bebita.lostandfoundportal.dto.UserResponse;
import edu.cit.bebita.lostandfoundportal.entity.Item;
import edu.cit.bebita.lostandfoundportal.entity.User;
import edu.cit.bebita.lostandfoundportal.exception.ResourceNotFoundException;
import edu.cit.bebita.lostandfoundportal.repository.ItemRepository;
import edu.cit.bebita.lostandfoundportal.repository.UserRepository;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public ItemService(ItemRepository itemRepository, UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
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
        item.setType("lost");
        item.setStatus("active");
        item.setReportedBy(user);

        Item savedItem = itemRepository.save(item);
        return mapToItemResponse(savedItem);
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
        item.setType("found");
        item.setStatus("active");
        item.setReportedBy(user);

        Item savedItem = itemRepository.save(item);
        return mapToItemResponse(savedItem);
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

    @Transactional
    public ItemResponse claimItem(Long itemId, String userEmail) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!"active".equals(item.getStatus())) {
            throw new IllegalStateException("Item is not available for claiming");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        item.setStatus("claimed");
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
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());

        if (item.getReportedBy() != null) {
            UserResponse reportedBy = new UserResponse(
                item.getReportedBy().getEmail(),
                item.getReportedBy().getFirstName(),
                item.getReportedBy().getLastName()
            );
            response.setReportedBy(reportedBy);
        }

        if (item.getClaimedByUser() != null) {
            UserResponse claimedBy = new UserResponse(
                item.getClaimedByUser().getEmail(),
                item.getClaimedByUser().getFirstName(),
                item.getClaimedByUser().getLastName()
            );
            response.setClaimedBy(claimedBy);
        }

        return response;
    }
}