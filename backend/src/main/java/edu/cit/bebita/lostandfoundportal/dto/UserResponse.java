package edu.cit.bebita.lostandfoundportal.dto;

public class UserResponse {

    private String email;
    private String firstname;
    private String lastname;
    private String role;

    public UserResponse(String email, String firstname, String lastname, String role) {
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.role = role;
    }

    public String getEmail() { return email; }
    public String getFirstname() { return firstname; }
    public String getLastname() { return lastname; }
    public String getRole() { return role; }
}
