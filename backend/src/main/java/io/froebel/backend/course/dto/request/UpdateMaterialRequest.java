package io.froebel.backend.course.dto.request;

import io.froebel.backend.model.enums.MaterialContentType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;
import java.util.UUID;

public record UpdateMaterialRequest(
    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 200, message = "Title must be between 2 and 200 characters")
    String title,

    @NotNull(message = "Content type is required")
    MaterialContentType contentType,

    @Size(max = 100000, message = "Content is too long")
    String content,

    UUID fileId,

    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 600, message = "Duration cannot exceed 600 minutes")
    Integer durationMinutes,

    Set<UUID> mediaIds
) {
}
