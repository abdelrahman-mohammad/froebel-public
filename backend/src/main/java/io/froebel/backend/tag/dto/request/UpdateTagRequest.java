package io.froebel.backend.tag.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateTagRequest(
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String name,

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color (e.g., #FF5733)")
    String color,

    @Size(max = 100, message = "Icon must be at most 100 characters")
    String icon
) {
}
