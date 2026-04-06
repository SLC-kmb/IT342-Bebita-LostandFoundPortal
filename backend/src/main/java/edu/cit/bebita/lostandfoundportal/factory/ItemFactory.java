package edu.cit.bebita.lostandfoundportal.factory;

import edu.cit.bebita.lostandfoundportal.dto.CreateItemRequest;
import edu.cit.bebita.lostandfoundportal.entity.Item;
import edu.cit.bebita.lostandfoundportal.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ItemFactory {

    public Item createItem(CreateItemRequest request, User user) {
        Item item = new Item();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setLocation(request.getLocation());
        item.setCategory(request.getCategory());
        item.setImageUrls(request.getImageUrls());
        item.setUser(user);
        item.setStatus(Item.ItemStatus.ACTIVE);

        // Set type based on request
        if ("LOST".equalsIgnoreCase(request.getType())) {
            item.setType(Item.ItemType.LOST);
        } else if ("FOUND".equalsIgnoreCase(request.getType())) {
            item.setType(Item.ItemType.FOUND);
        } else {
            throw new IllegalArgumentException("Invalid item type: " + request.getType());
        }

        return item;
    }

    public Item createLostItem(CreateItemRequest request, User user) {
        request.setType("LOST");
        return createItem(request, user);
    }

    public Item createFoundItem(CreateItemRequest request, User user) {
        request.setType("FOUND");
        return createItem(request, user);
    }
}
