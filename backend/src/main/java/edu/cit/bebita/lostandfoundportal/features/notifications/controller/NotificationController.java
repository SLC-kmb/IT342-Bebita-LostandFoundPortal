package edu.cit.bebita.lostandfoundportal.features.notifications.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import edu.cit.bebita.lostandfoundportal.features.auth.model.User;
import edu.cit.bebita.lostandfoundportal.features.auth.repository.UserRepository;
import edu.cit.bebita.lostandfoundportal.features.notifications.dto.NotificationDto;
import edu.cit.bebita.lostandfoundportal.features.notifications.model.Notification;
import edu.cit.bebita.lostandfoundportal.features.notifications.repository.NotificationRepository;
import edu.cit.bebita.lostandfoundportal.shared.api.ApiResponse;
import edu.cit.bebita.lostandfoundportal.shared.api.ApiError;
import edu.cit.bebita.lostandfoundportal.shared.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getUserNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        List<NotificationDto> dtos = notifications.stream()
                .map(n -> new NotificationDto(n.getId(), n.getTitle(), n.getMessage(), n.isRead(), n.getCreatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getEmail().equals(userDetails.getUsername())) {
            return ResponseEntity.status(403).body(ApiResponse.error(new ApiError("UNAUTHORIZED", "Unauthorized", null)));
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteNotification(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getEmail().equals(userDetails.getUsername())) {
            return ResponseEntity.status(403).body(ApiResponse.error(new ApiError("UNAUTHORIZED", "Unauthorized", null)));
        }

        notificationRepository.delete(notification);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> deleteAllNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        notificationRepository.deleteByUser(user);
        return ResponseEntity.ok(ApiResponse.success("All notifications deleted successfully"));
    }
}
