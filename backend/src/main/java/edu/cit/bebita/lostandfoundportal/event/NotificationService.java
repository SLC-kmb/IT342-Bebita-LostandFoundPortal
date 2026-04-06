package edu.cit.bebita.lostandfoundportal.event;

import edu.cit.bebita.lostandfoundportal.entity.Item;
import edu.cit.bebita.lostandfoundportal.entity.User;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        User user = event.getUser();
        System.out.println("User registered: " + user.getEmail() +
                          ". Sending welcome notification...");
        // Here you would typically send an actual email or notification
    }

    @EventListener
    public void handleItemCreated(ItemCreatedEvent event) {
        Item item = event.getItem();
        User user = event.getUser();
        System.out.println("New item created: " + item.getTitle() +
                          " by user: " + user.getEmail());
        // Here you would typically send notifications to relevant parties
    }
}