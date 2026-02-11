package io.froebel.backend.quiz.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record QuizAnalyticsSummaryResponse(
    UUID quizId,
    String quizTitle,
    long totalAttempts,
    long completedAttempts,
    BigDecimal passRate,
    BigDecimal averageScore,
    Integer averageTimeSeconds
) {
}
