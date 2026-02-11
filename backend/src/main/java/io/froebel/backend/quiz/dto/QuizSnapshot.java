package io.froebel.backend.quiz.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Complete snapshot of a quiz state for version history.
 * Stored as JSONB in the quiz_history table.
 */
public record QuizSnapshot(
    // Basic info
    String title,
    String description,
    String iconUrl,
    String bannerUrl,

    // Settings
    Settings settings,

    // Access control
    Access access,

    // Scheduling
    Scheduling scheduling,

    // Questions (full snapshot)
    List<QuestionSnapshot> questions,

    // Relationships (stored as IDs)
    UUID categoryId,
    UUID courseId,
    Set<String> tagNames
) {
    public record Settings(
        Integer timeLimit,
        Integer passingScore,
        boolean shuffleQuestions,
        boolean shuffleChoices,
        boolean showCorrectAnswers,
        Integer maxAttempts,
        boolean aiGradingEnabled
    ) {
    }

    public record Access(
        boolean isPublic,
        boolean allowAnonymous,
        boolean requireAccessCode,
        boolean hasAccessCode,  // Whether an access code is set (don't store the hash)
        boolean filterIpAddresses,
        String allowedIpAddresses
    ) {
    }

    public record Scheduling(
        Instant availableFrom,
        Instant availableUntil,
        Instant resultsVisibleFrom
    ) {
    }

    public record QuestionSnapshot(
        UUID id,  // Question UUID for answer matching during scoring
        String text,
        String type,
        Integer points,
        Integer questionOrder,
        String chapter,
        String explanation,
        String hintCorrect,
        String hintWrong,
        String identifier,
        Map<String, Object> data
    ) {
    }
}
