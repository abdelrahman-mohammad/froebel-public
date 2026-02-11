package io.froebel.backend.quiz.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record QuizAnalyticsResponse(
    UUID quizId,
    String quizTitle,

    // Attempt counts
    long totalAttempts,
    long completedAttempts,
    long inProgressAttempts,

    // Score metrics
    BigDecimal passRate,
    BigDecimal averageScore,
    Integer medianScore,
    Integer highestScore,
    Integer lowestScore,

    // Time metrics
    Integer averageTimeSeconds,
    Integer fastestTimeSeconds,
    Integer slowestTimeSeconds,

    // Score distribution (5 buckets: 0-20%, 21-40%, 41-60%, 61-80%, 81-100%)
    ScoreDistribution scoreDistribution,

    // Per-question analytics
    List<QuestionAnalytics> questionAnalytics,

    // Time series data (attempts per day)
    List<TimeSeriesDataPoint> attemptsOverTime
) {
    public record ScoreDistribution(
        int bucket0to20,
        int bucket21to40,
        int bucket41to60,
        int bucket61to80,
        int bucket81to100
    ) {
        public static ScoreDistribution empty() {
            return new ScoreDistribution(0, 0, 0, 0, 0);
        }
    }

    public record QuestionAnalytics(
        UUID questionId,
        String questionText,
        String questionType,
        int questionOrder,
        long totalAnswers,
        long correctAnswers,
        BigDecimal successRate,
        Integer averageTimeSeconds,
        int points
    ) {
    }

    public record TimeSeriesDataPoint(
        String date,
        long attemptCount,
        long completedCount,
        BigDecimal averageScore
    ) {
    }

    public static QuizAnalyticsResponse empty(UUID quizId, String quizTitle, long totalAttempts, long inProgressAttempts) {
        return new QuizAnalyticsResponse(
            quizId,
            quizTitle,
            totalAttempts,
            0L,
            inProgressAttempts,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            ScoreDistribution.empty(),
            List.of(),
            List.of()
        );
    }
}
