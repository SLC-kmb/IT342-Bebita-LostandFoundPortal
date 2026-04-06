package edu.cit.bebita.lostandfoundportal.event;

import edu.cit.bebita.lostandfoundportal.entity.User;

public class UserRegisteredEvent {
    private final User user;

    public UserRegisteredEvent(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }
}
