package edu.cit.bebita.lostandfoundportal.event;

import edu.cit.bebita.lostandfoundportal.entity.Item;
import edu.cit.bebita.lostandfoundportal.entity.User;

public class ItemCreatedEvent {
    private final Item item;
    private final User user;

    public ItemCreatedEvent(Item item, User user) {
        this.item = item;
        this.user = user;
    }

    public Item getItem() {
        return item;
    }

    public User getUser() {
        return user;
    }
}
