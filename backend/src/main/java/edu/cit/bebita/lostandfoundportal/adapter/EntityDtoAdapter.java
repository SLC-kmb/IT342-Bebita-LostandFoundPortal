package edu.cit.bebita.lostandfoundportal.adapter;

import edu.cit.bebita.lostandfoundportal.dto.ItemDto;
import edu.cit.bebita.lostandfoundportal.dto.UserResponse;
import edu.cit.bebita.lostandfoundportal.entity.Item;
import edu.cit.bebita.lostandfoundportal.entity.User;
import org.springframework.stereotype.Component;

@Component
public class EntityDtoAdapter {

    public UserResponse adapt(User user) {
        return new UserResponse(user.getEmail(), user.getFirstName(), user.getLastName());
    }

    public ItemDto adapt(Item item) {
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
