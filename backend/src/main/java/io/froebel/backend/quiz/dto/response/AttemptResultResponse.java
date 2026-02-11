package io.froebel.backend.quiz.dto.response;

import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.entity.QuizAttempt;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AttemptResultResponse(
    UUID id,
    UUID quizId,
    String quizTitle,
    Integer score,
    Integer maxScore,
    BigDecimal percentage,
    Boolean passed,
    Integer passingScore,
    Instant startedAt,
    Instant completedAt,
    Integer timeTakenSeconds,
    List<AnswerResultResponse> answerResults,
    boolean showCorrectAnswers,
    boolean resultsAvailable,
    Instant resultsVisibleFrom
) {
    public static AttemptResultResponse from(
        QuizAttempt attempt,
        List<AnswerResultResponse> answerResults,
        Quiz quiz
    ) {
        return new AttemptResultResponse(
            attempt.getId(),
            quiz.getId(),
            quiz.getTitle(),
            attempt.getScore(),
            attempt.getMaxScore(),
            attempt.getPercentage(),
            attempt.getPassed(),
            quiz.getPassingScore(),
            attempt.getStartedAt(),
            attempt.getCompletedAt(),
            attempt.getTimeTakenSeconds(),
            answerResults,
            quiz.isShowCorrectAnswers(),
            true,
            quiz.getResultsVisibleFrom()
        );
    }

    public static AttemptResultResponse fromPending(QuizAttempt attempt, Quiz quiz) {
        return new AttemptResultResponse(
            attempt.getId(),
            quiz.getId(),
            quiz.getTitle(),
            null,  // Hide score until results are visible
            null,
            null,
            null,
            quiz.getPassingScore(),
            attempt.getStartedAt(),
            attempt.getCompletedAt(),
            attempt.getTimeTakenSeconds(),
            List.of(),  // No answer details
            false,
            false,  // Results not available yet
            quiz.getResultsVisibleFrom()
        );
    }
}
