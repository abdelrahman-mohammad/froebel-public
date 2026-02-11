package io.froebel.backend.course.dto.request;

import io.froebel.backend.model.enums.Difficulty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

public record CreateCourseRequest(
    @NotBlank(message = "Title is required")
    @Size(min = 4, max = 200, message = "Title must be between 4 and 200 characters")
    String title,

    @Size(max = 5000, message = "Description must be at most 5000 characters")
    String description,

    String imageUrl,

    UUID categoryId,

    Difficulty difficulty,

    @DecimalMin(value = "0.5", message = "Estimated hours must be at least 0.5")
    @DecimalMax(value = "1000", message = "Estimated hours cannot exceed 1000")
    BigDecimal estimatedHours,

    Set<String> tagNames
) {
    public CreateCourseRequest {
        if (difficulty == null) difficulty = Difficulty.BEGINNER;
    }
}
