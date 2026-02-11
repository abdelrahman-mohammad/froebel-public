package io.froebel.backend.category.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateCategoryRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    String name,

    @Size(max = 2000, message = "Description must be at most 2000 characters")
    String description,

    UUID parentId,

    @Size(max = 100, message = "Icon must be at most 100 characters")
    String icon,

    Integer sortOrder,

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color (e.g., #FF5733)")
    String color,

    @Size(max = 500, message = "Image URL must be at most 500 characters")
    String imageUrl,

    Boolean isFeatured,

    Boolean isActive
) {
    public CreateCategoryRequest {
        if (sortOrder == null) sortOrder = 0;
        if (isFeatured == null) isFeatured = false;
        if (isActive == null) isActive = true;
    }
}
