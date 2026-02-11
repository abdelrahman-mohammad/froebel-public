package io.froebel.backend.quiz.dto.response;

import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.entity.Tag;
import io.froebel.backend.model.enums.QuizAvailabilityStatus;
import io.froebel.backend.model.enums.QuizStatus;
import io.froebel.backend.quiz.dto.QuizSnapshot;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record QuizSummaryResponse(
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
    Integer maxAttempts,
    int questionCount,
    int totalPoints,
    Set<String> tags,
    Instant createdAt,
    Instant updatedAt,
    // Scheduling fields
    Instant availableFrom,
    Instant availableUntil,
    Instant resultsVisibleFrom,
    QuizAvailabilityStatus availabilityStatus
) {
    public static QuizSummaryResponse from(Quiz quiz) {
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

        // Fallback to email if displayName is null or blank
        String displayName = quiz.getCreator().getDisplayName();
        if (displayName == null || displayName.isBlank()) {
            displayName = quiz.getCreator().getEmail();
        }

        return new QuizSummaryResponse(
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
            quiz.getMaxAttempts(),
            questionCount,
            totalPoints,
            tagNames,
            quiz.getCreatedAt(),
            quiz.getUpdatedAt(),
            quiz.getAvailableFrom(),
            quiz.getAvailableUntil(),
            quiz.getResultsVisibleFrom(),
            quiz.getAvailabilityStatus()
        );
    }

    /**
     * Build a QuizSummaryResponse from a published snapshot.
     * Used to serve the frozen published version on browse/explore pages.
     *
     * @param quiz     The quiz entity (for id, shareableId, creator, status, timestamps)
     * @param snapshot The published snapshot to serve
     */
    public static QuizSummaryResponse fromSnapshot(Quiz quiz, QuizSnapshot snapshot) {
        int totalPoints = snapshot.questions().stream()
            .mapToInt(q -> q.points() != null ? q.points() : 1)
            .sum();

        // Tags come from snapshot if available, otherwise from entity
        Set<String> tagNames = snapshot.tagNames() != null ? snapshot.tagNames() :
            quiz.getTags().stream().map(Tag::getName).collect(Collectors.toSet());

        // Fallback to email if displayName is null or blank
        String displayName = quiz.getCreator().getDisplayName();
        if (displayName == null || displayName.isBlank()) {
            displayName = quiz.getCreator().getEmail();
        }

        return new QuizSummaryResponse(
            quiz.getId(),
            quiz.getShareableId(),
            snapshot.title(),
            snapshot.description(),
            quiz.getCreator().getId(),
            displayName,
            snapshot.courseId(),
            snapshot.categoryId(),
            quiz.getStatus(),
            snapshot.access().isPublic(),
            snapshot.access().allowAnonymous(),
            snapshot.settings().timeLimit(),
            snapshot.settings().passingScore(),
            snapshot.settings().maxAttempts(),
            snapshot.questions().size(),
            totalPoints,
            tagNames,
            quiz.getCreatedAt(),
            quiz.getUpdatedAt(),
            snapshot.scheduling().availableFrom(),
            snapshot.scheduling().availableUntil(),
            snapshot.scheduling().resultsVisibleFrom(),
            quiz.getAvailabilityStatus()
        );
    }
}
