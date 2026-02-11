package io.froebel.backend.quiz.dto.response;

import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.enums.QuizAvailabilityStatus;
import io.froebel.backend.model.enums.QuizStatus;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Quiz response DTO for non-owner views.
 * Excludes sensitive fields like accessCode and allowedIpAddresses.
 */
public record QuizPublicResponse(
    UUID id,
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
    // Access restriction indicators (without sensitive values)
    boolean requireAccessCode,
    boolean filterIpAddresses,
    // Optimistic locking version
    Long version
) {
    public static QuizPublicResponse from(Quiz quiz) {
        // Deduplicate questions by ID to handle Cartesian product from EntityGraph
        Set<UUID> seenIds = new LinkedHashSet<>();
        int questionCount = 0;
        int totalPoints = 0;
        for (Question q : quiz.getQuestions()) {
            if (seenIds.add(q.getId())) {
                questionCount++;
                totalPoints += q.getPoints() != null ? q.getPoints() : 1;
            }
        }

        Set<String> tagNames = quiz.getTags().stream()
            .map(tag -> tag.getName())
            .collect(Collectors.toSet());

        String displayName = quiz.getCreator().getDisplayName();
        if (displayName == null || displayName.isBlank()) {
            displayName = quiz.getCreator().getEmail();
        }

        return new QuizPublicResponse(
            quiz.getId(),
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
            questionCount,
            totalPoints,
            tagNames,
            quiz.getCreatedAt(),
            quiz.getUpdatedAt(),
            quiz.getAvailableFrom(),
            quiz.getAvailableUntil(),
            quiz.getResultsVisibleFrom(),
            quiz.getAvailabilityStatus(),
            quiz.isRequireAccessCode(),
            quiz.isFilterIpAddresses(),
            quiz.getVersion()
        );
    }
}
