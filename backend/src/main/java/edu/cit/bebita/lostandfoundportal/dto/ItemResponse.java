package edu.cit.bebita.lostandfoundportal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ItemResponse {

    private Long id;
    private String itemName;
    private String description;
    private String category;
    private String location;
    private LocalDate dateLost;
    private LocalDate dateFound;
    private String contactInfo;
    private String type;
    private String status;
    private UserResponse reportedBy;
    private UserResponse claimedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDate getDateLost() { return dateLost; }
    public void setDateLost(LocalDate dateLost) { this.dateLost = dateLost; }

    public LocalDate getDateFound() { return dateFound; }
    public void setDateFound(LocalDate dateFound) { this.dateFound = dateFound; }

    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public UserResponse getReportedBy() { return reportedBy; }
    public void setReportedBy(UserResponse reportedBy) { this.reportedBy = reportedBy; }

    public UserResponse getClaimedBy() { return claimedBy; }
    public void setClaimedBy(UserResponse claimedBy) { this.claimedBy = claimedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}