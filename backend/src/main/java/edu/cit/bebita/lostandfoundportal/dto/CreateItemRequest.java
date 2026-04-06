package edu.cit.bebita.lostandfoundportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateItemRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotBlank(message = "Type is required")
    private String type; // "LOST" or "FOUND"

    private String location;

    private String category;

    @Size(max = 5, message = "Maximum 5 images allowed")
    private List<String> imageUrls;
}
