package edu.cit.bebita.lostandfoundportal.dto;

import edu.cit.bebita.lostandfoundportal.entity.Item;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ItemDto {
    private Long id;
    private String title;
    private String description;
    private Item.ItemStatus status;
    private Item.ItemType type;
    private String location;
    private String category;
    private Long userId;
    private String userEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> imageUrls;

    public static ItemDto fromEntity(Item item) {
        return ItemDto.builder()
                .id(item.getId())
                .title(item.getTitle())
                .description(item.getDescription())
                .status(item.getStatus())
                .type(item.getType())
                .location(item.getLocation())
                .category(item.getCategory())
                .userId(item.getUser().getId())
                .userEmail(item.getUser().getEmail())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .imageUrls(item.getImageUrls())
                .build();
    }
}
