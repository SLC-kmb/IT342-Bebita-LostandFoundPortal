package edu.cit.bebita.lostandfoundportal.features.auth.dto;

public class UserResponse {

    private String email;
    private String firstname;
    private String lastname;
    private String studentId;
    private String role;

    public UserResponse(String email, String firstname, String lastname, String studentId) {
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.studentId = studentId;
    }

    public UserResponse(String email, String firstname, String lastname, String studentId, String role) {
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.studentId = studentId;
        this.role = role;
    }

    public String getEmail() { return email; }
    public String getFirstname() { return firstname; }
    public String getLastname() { return lastname; }
    public String getStudentId() { return studentId; }
    public String getRole() { return role; }
}
