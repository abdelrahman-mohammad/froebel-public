package io.froebel.backend.quiz.dto.response;

import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.enums.QuizAvailabilityStatus;
import io.froebel.backend.model.enums.QuizStatus;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record QuizResponse(
    UUID id,
    String shareableId,
    String title,
    String description,
    UUID creatorId,
    String creatorDisplayName,
    UUID courseId,
    UUID categoryId,
    QuizStatus status,
    boolean isPublic,
    boolean allowAnonymous,
    Integer timeLimit,
    Integer passingScore,
    boolean shuffleQuestions,
    boolean shuffleChoices,
    boolean showCorrectAnswers,
    Integer maxAttempts,
    boolean aiGradingEnabled,
    int questionCount,
    int totalPoints,
    Set<String> tags,
    Instant createdAt,
    Instant updatedAt,
    // Scheduling fields
    Instant availableFrom,
    Instant availableUntil,
    Instant resultsVisibleFrom,
    QuizAvailabilityStatus availabilityStatus,
    // Access restriction fields
    boolean requireAccessCode,
    String accessCode,  // Only exposed to quiz owner
    boolean filterIpAddresses,
    String allowedIpAddresses,
    // Optimistic locking version
    Long version
) {
    /**
     * Create response for quiz owner.
     * Includes all fields including sensitive access code and IP addresses.
     */
    public static QuizResponse from(Quiz quiz) {
        return from(quiz, true);
    }

    /**
     * Create response with explicit owner flag.
     * When isOwner is false, sensitive fields (accessCode, allowedIpAddresses) are masked.
     */
    public static QuizResponse from(Quiz quiz, boolean isOwner) {
        int totalPoints = quiz.getQuestions().stream()
            .mapToInt(q -> q.getPoints() != null ? q.getPoints() : 1)
            .sum();

        Set<String> tagNames = quiz.getTags().stream()
            .map(tag -> tag.getName())
            .collect(Collectors.toSet());

        // Fallback to email if displayName is null or blank
        String displayName = quiz.getCreator().getDisplayName();
        if (displayName == null || displayName.isBlank()) {
            displayName = quiz.getCreator().getEmail();
        }

        // Mask sensitive fields for non-owners
        String accessCode = isOwner ? quiz.getAccessCode() : null;
        String allowedIpAddresses = isOwner ? quiz.getAllowedIpAddresses() : null;

        return new QuizResponse(
            quiz.getId(),
            quiz.getShareableId(),
            quiz.getTitle(),
            quiz.getDescription(),
            quiz.getCreator().getId(),
            displayName,
            quiz.getCourse() != null ? quiz.getCourse().getId() : null,
            quiz.getCategory() != null ? quiz.getCategory().getId() : null,
            quiz.getStatus(),
            quiz.isPublic(),
            quiz.isAllowAnonymous(),
            quiz.getTimeLimit(),
            quiz.getPassingScore(),
            quiz.isShuffleQuestions(),
            quiz.isShuffleChoices(),
            quiz.isShowCorrectAnswers(),
            quiz.getMaxAttempts(),
            quiz.isAiGradingEnabled(),
            quiz.getQuestions().size(),
            totalPoints,
            tagNames,
            quiz.getCreatedAt(),
            quiz.getUpdatedAt(),
            quiz.getAvailableFrom(),
            quiz.getAvailableUntil(),
            quiz.getResultsVisibleFrom(),
            quiz.getAvailabilityStatus(),
            quiz.isRequireAccessCode(),
            accessCode,
            quiz.isFilterIpAddresses(),
            allowedIpAddresses,
            quiz.getVersion()
        );
    }
}
