package io.froebel.backend.quiz.dto.response;

import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.enums.QuizAvailabilityStatus;
import io.froebel.backend.model.enums.QuizStatus;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record QuizDetailResponse(
    UUID id,
    String shareableId,
    String title,
    String description,
    String iconUrl,
    String bannerUrl,
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
    List<QuestionResponse> questions,
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
    Long version,
    // Published version tracking
    Integer publishedVersionNumber,
    boolean hasUnpublishedChanges  // true if draft differs from published version
) {
    /**
     * Create response for quiz owner.
     * Includes all fields including sensitive access code and IP addresses.
     */
    public static QuizDetailResponse from(Quiz quiz) {
        return from(quiz, false, true);
    }

    /**
     * Create response for quiz owner with explicit hasUnpublishedChanges value.
     */
    public static QuizDetailResponse from(Quiz quiz, boolean hasUnpublishedChanges) {
        return from(quiz, hasUnpublishedChanges, true);
    }

    /**
     * Create response with explicit hasUnpublishedChanges and owner flag.
     * When isOwner is false, sensitive fields (accessCode, allowedIpAddresses) are masked.
     */
    public static QuizDetailResponse from(Quiz quiz, boolean hasUnpublishedChanges, boolean isOwner) {
        // Deduplicate questions by ID to handle Cartesian product from EntityGraph
        // when both questions and tags are fetched via LEFT JOIN FETCH
        Map<UUID, Question> uniqueQuestions = new LinkedHashMap<>();
        for (Question q : quiz.getQuestions()) {
            uniqueQuestions.putIfAbsent(q.getId(), q);
        }

        List<QuestionResponse> questionResponses = uniqueQuestions.values().stream()
            .map(QuestionResponse::from)
            .collect(Collectors.toList());

        int totalPoints = uniqueQuestions.values().stream()
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

        return new QuizDetailResponse(
            quiz.getId(),
            quiz.getShareableId(),
            quiz.getTitle(),
            quiz.getDescription(),
            quiz.getIconUrl(),
            quiz.getBannerUrl(),
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
            questionResponses,
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
            quiz.getVersion(),
            quiz.getPublishedVersionNumber(),
            hasUnpublishedChanges
        );
    }
}
