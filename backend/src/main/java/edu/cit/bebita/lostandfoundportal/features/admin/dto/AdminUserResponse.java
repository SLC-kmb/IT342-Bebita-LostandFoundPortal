package edu.cit.bebita.lostandfoundportal.features.admin.dto;

import java.time.LocalDateTime;

public class AdminUserResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String authProvider;
    private LocalDateTime createdAt;

    public AdminUserResponse() {}

    public AdminUserResponse(Long id, String email, String firstName, String lastName,
                              String role, String authProvider, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.authProvider = authProvider;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
