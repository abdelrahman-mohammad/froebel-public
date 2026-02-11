package io.froebel.backend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.util.Map;

public record UpdateProfileRequest(
    @NotBlank(message = "Display name is required")
    @Size(min = 2, max = 50, message = "Display name must be between 2 and 50 characters")
    String displayName,

    @Size(max = 100, message = "Full name must be at most 100 characters")
    String fullName,

    @Size(max = 500, message = "Bio must be at most 500 characters")
    String bio,

    @Size(max = 100, message = "Location must be at most 100 characters")
    String location,

    @URL(message = "Website must be a valid URL")
    @Size(max = 500, message = "Website URL must be at most 500 characters")
    String website,

    @Size(max = 500, message = "Avatar URL must be at most 500 characters")
    String avatarUrl,

    Map<String, String> socialLinks
) {
}
