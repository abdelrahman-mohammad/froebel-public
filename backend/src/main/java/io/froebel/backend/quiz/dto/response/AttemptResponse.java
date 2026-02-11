package io.froebel.backend.quiz.dto.response;

import io.froebel.backend.model.entity.QuizAttempt;

import java.time.Instant;
import java.util.UUID;

public record AttemptResponse(
    UUID id,
    UUID quizId,
    String quizTitle,
    UUID userId,
    String anonymousName,
    Instant startedAt,
    Instant completedAt,
    Integer timeTakenSeconds,
    boolean isCompleted
) {
    public static AttemptResponse from(QuizAttempt attempt) {
        return new AttemptResponse(
            attempt.getId(),
            attempt.getQuiz().getId(),
            attempt.getQuiz().getTitle(),
            attempt.getUser() != null ? attempt.getUser().getId() : null,
            attempt.getAnonymousName(),
            attempt.getStartedAt(),
            attempt.getCompletedAt(),
            attempt.getTimeTakenSeconds(),
            attempt.isCompleted()
        );
    }
}
