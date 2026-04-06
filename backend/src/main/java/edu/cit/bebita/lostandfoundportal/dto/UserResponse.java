package edu.cit.bebita.lostandfoundportal.dto;

import edu.cit.bebita.lostandfoundportal.entity.User;

public class UserResponse {

    private String email;
    private String firstname;
    private String lastname;

    public UserResponse(String email, String firstname, String lastname) {
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
    }

    public static UserResponse fromUser(User user) {
        return new UserResponse(user.getEmail(), user.getFirstName(), user.getLastName());
    }

    public String getEmail() { return email; }
    public String getFirstname() { return firstname; }
    public String getLastname() { return lastname; }
}
