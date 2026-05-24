package edu.cit.bebita.lostandfoundportal.features.admin.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.bebita.lostandfoundportal.features.admin.dto.AdminUserResponse;
import edu.cit.bebita.lostandfoundportal.features.admin.dto.DashboardStatsResponse;
import edu.cit.bebita.lostandfoundportal.features.auth.dto.UserResponse;
import edu.cit.bebita.lostandfoundportal.features.auth.model.User;
import edu.cit.bebita.lostandfoundportal.features.auth.repository.UserRepository;
import edu.cit.bebita.lostandfoundportal.features.items.dto.ItemResponse;
import edu.cit.bebita.lostandfoundportal.features.items.model.Item;
import edu.cit.bebita.lostandfoundportal.features.items.repository.ItemRepository;
import edu.cit.bebita.lostandfoundportal.shared.exception.ResourceNotFoundException;
import edu.cit.bebita.lostandfoundportal.shared.exception.UnauthorizedException;

@Service
public class AdminService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public AdminService(ItemRepository itemRepository, UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    /**
     * Verify the requesting user has ADMIN role.
     */
    private User verifyAdmin(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!"ADMIN".equals(user.getRole())) {
            throw new UnauthorizedException("Access denied. Admin role required.");
        }

        return user;
    }

    /**
     * Get dashboard statistics: counts of items, claims, users.
     */
    public DashboardStatsResponse getDashboardStats(String adminEmail) {
        verifyAdmin(adminEmail);

        long totalItems = itemRepository.count();
        long pendingClaims = itemRepository.countByStatus("pending_claim");
        long activeItems = itemRepository.countByStatus("active");
        long totalUsers = userRepository.count();
        long lostItems = itemRepository.countByType("lost");
        long foundItems = itemRepository.countByType("found");

        return new DashboardStatsResponse(totalItems, pendingClaims, activeItems,
                totalUsers, lostItems, foundItems);
    }

    /**
     * Get all items with pending_claim status.
     */
    public List<ItemResponse> getPendingClaims(String adminEmail) {
        verifyAdmin(adminEmail);

        List<Item> items = itemRepository.findByStatus("pending_claim");
        return items.stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());
    }

    /**
     * Approve a pending claim — sets status to "claimed".
     */
    @Transactional
    public ItemResponse approveClaim(Long itemId, String adminEmail) {
        verifyAdmin(adminEmail);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!"pending_claim".equals(item.getStatus())) {
            throw new IllegalStateException("Item does not have a pending claim");
        }

        item.setStatus("claimed");
        Item updatedItem = itemRepository.save(item);
        return mapToItemResponse(updatedItem);
    }

    /**
     * Reject a pending claim — sets status back to "active" and clears the claimant.
     */
    @Transactional
    public ItemResponse rejectClaim(Long itemId, String adminEmail) {
        verifyAdmin(adminEmail);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!"pending_claim".equals(item.getStatus())) {
            throw new IllegalStateException("Item does not have a pending claim");
        }

        item.setStatus("active");
        item.setClaimedByUser(null);
        Item updatedItem = itemRepository.save(item);
        return mapToItemResponse(updatedItem);
    }

    /**
     * Get all registered users.
     */
    public List<AdminUserResponse> getAllUsers(String adminEmail) {
        verifyAdmin(adminEmail);

        return userRepository.findAll().stream()
                .map(this::mapToAdminUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all items regardless of status.
     */
    public List<ItemResponse> getAllItems(String adminEmail) {
        verifyAdmin(adminEmail);

        return itemRepository.findAll().stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());
    }

    /**
     * Delete an item by ID.
     */
    @Transactional
    public void deleteItem(Long itemId, String adminEmail) {
        verifyAdmin(adminEmail);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
        itemRepository.delete(item);
    }

    /**
     * Delete a user by ID. Cascades to delete reported items and unclaim claimed items.
     */
    @Transactional
    public void deleteUser(Long userId, String adminEmail) {
        verifyAdmin(adminEmail);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        if ("ADMIN".equals(user.getRole())) {
            throw new IllegalStateException("Cannot delete an ADMIN user via dashboard");
        }

        // Delete all items reported by the user
        List<Item> reportedItems = itemRepository.findByReportedBy(user);
        itemRepository.deleteAll(reportedItems);

        // Unclaim any items claimed by the user
        List<Item> claimedItems = itemRepository.findByClaimedByUser(user);
        for (Item item : claimedItems) {
            item.setClaimedByUser(null);
            item.setStatus("active");
            itemRepository.save(item);
        }
        
        userRepository.delete(user);
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

    private AdminUserResponse mapToAdminUserResponse(User user) {
        return new AdminUserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole(),
            user.getAuthProvider(),
            user.getCreatedAt()
        );
    }
}
