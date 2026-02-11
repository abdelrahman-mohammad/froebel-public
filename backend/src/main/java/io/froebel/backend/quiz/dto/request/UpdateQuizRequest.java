package io.froebel.backend.quiz.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record UpdateQuizRequest(
    @NotBlank(message = "Title is required")
    @Size(min = 4, max = 200, message = "Title must be between 4 and 200 characters")
    String title,

    @Size(max = 2000, message = "Description must be at most 2000 characters")
    String description,

    String iconUrl,

    String bannerUrl,

    UUID courseId,

    UUID categoryId,

    Boolean isPublic,

    Boolean allowAnonymous,

    @Min(value = 1, message = "Timer must be at least 1 minute")
    @Max(value = 480, message = "Timer cannot exceed 8 hours")
    Integer timeLimit,

    @Min(value = 0, message = "Passing score must be non-negative")
    @Max(value = 100, message = "Passing score cannot exceed 100")
    Integer passingScore,

    Boolean shuffleQuestions,

    Boolean shuffleChoices,

    Boolean showCorrectAnswers,

    @Min(value = 1, message = "Max attempts must be at least 1")
    Integer maxAttempts,

    Boolean aiGradingEnabled,

    Set<String> tagNames,

    // Scheduling fields
    Instant availableFrom,
    Instant availableUntil,
    Instant resultsVisibleFrom,

    // Access restriction fields
    Boolean requireAccessCode,

    @Size(min = 4, max = 20, message = "Access code must be between 4 and 20 characters")
    String accessCode,

    Boolean filterIpAddresses,

    @Size(max = 10000, message = "Allowed IP addresses must be at most 10000 characters")
    String allowedIpAddresses,

    // Optimistic locking version (client sends expected version)
    Long version
) {
}
