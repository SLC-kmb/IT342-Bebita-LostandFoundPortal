package edu.cit.bebita.lostandfoundportal.dto;

public class UserResponse {

    private String email;
    private String firstname;
    private String lastname;

    public UserResponse(String email, String firstname, String lastname) {
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
    }

    public String getEmail() { return email; }
    public String getFirstname() { return firstname; }
    public String getLastname() { return lastname; }
}
