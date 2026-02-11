package io.froebel.backend.quiz.service;

import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.quiz.dto.response.QuizAnalyticsResponse;
import io.froebel.backend.quiz.dto.response.QuizAnalyticsResponse.QuestionAnalytics;
import io.froebel.backend.quiz.dto.response.QuizAnalyticsResponse.ScoreDistribution;
import io.froebel.backend.quiz.dto.response.QuizAnalyticsResponse.TimeSeriesDataPoint;
import io.froebel.backend.quiz.dto.response.QuizAnalyticsSummaryResponse;
import io.froebel.backend.repository.QuestionRepository;
import io.froebel.backend.repository.QuizAnswerRepository;
import io.froebel.backend.repository.QuizAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class QuizAnalyticsService {

    private final QuizService quizService;
    private final QuizAttemptRepository attemptRepository;
    private final QuizAnswerRepository answerRepository;
    private final QuestionRepository questionRepository;

    public QuizAnalyticsService(
        QuizService quizService,
        QuizAttemptRepository attemptRepository,
        QuizAnswerRepository answerRepository,
        QuestionRepository questionRepository
    ) {
        this.quizService = quizService;
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
    }

    public QuizAnalyticsResponse getQuizAnalytics(UUID quizId, UUID userId) {
        return getQuizAnalytics(quizId, userId, 30);
    }

    public QuizAnalyticsResponse getQuizAnalytics(UUID quizId, UUID userId, int days) {
        Quiz quiz = quizService.findOwnedQuiz(quizId, userId);

        // Basic counts
        long totalAttempts = attemptRepository.countByQuizId(quizId);
        long completedAttempts = attemptRepository.countByQuizIdAndCompletedAtIsNotNull(quizId);
        long inProgressAttempts = attemptRepository.countByQuizIdAndCompletedAtIsNull(quizId);

        // Early return if no completed attempts
        if (completedAttempts == 0) {
            return QuizAnalyticsResponse.empty(quizId, quiz.getTitle(), totalAttempts, inProgressAttempts);
        }

        // Score metrics
        long passedCount = attemptRepository.countPassedAttemptsByQuizId(quizId);
        BigDecimal passRate = calculatePercentage(passedCount, completedAttempts);
        BigDecimal averageScore = attemptRepository.findAverageScoreByQuizId(quizId);

        // All scores for distribution and median
        List<BigDecimal> allScores = attemptRepository.findAllScoresByQuizId(quizId);
        Integer medianScore = calculateMedian(allScores);
        Integer highestScore = attemptRepository.findMaxScoreByQuizId(quizId);
        Integer lowestScore = attemptRepository.findMinScoreByQuizId(quizId);

        // Time metrics
        Double avgTime = attemptRepository.findAverageTimeByQuizId(quizId);
        Integer averageTimeSeconds = avgTime != null ? avgTime.intValue() : null;
        Integer fastestTime = attemptRepository.findMinTimeByQuizId(quizId);
        Integer slowestTime = attemptRepository.findMaxTimeByQuizId(quizId);

        // Score distribution
        ScoreDistribution distribution = calculateScoreDistribution(allScores);

        // Per-question analytics
        List<QuestionAnalytics> questionAnalytics = buildQuestionAnalytics(quizId);

        // Time series
        List<TimeSeriesDataPoint> timeSeries = buildTimeSeries(quizId, days);

        return new QuizAnalyticsResponse(
            quizId,
            quiz.getTitle(),
            totalAttempts,
            completedAttempts,
            inProgressAttempts,
            passRate,
            averageScore != null ? averageScore.setScale(2, RoundingMode.HALF_UP) : null,
            medianScore,
            highestScore,
            lowestScore,
            averageTimeSeconds,
            fastestTime,
            slowestTime,
            distribution,
            questionAnalytics,
            timeSeries
        );
    }

    public QuizAnalyticsSummaryResponse getQuizAnalyticsSummary(UUID quizId, UUID userId) {
        Quiz quiz = quizService.findOwnedQuiz(quizId, userId);

        long totalAttempts = attemptRepository.countByQuizId(quizId);
        long completedAttempts = attemptRepository.countByQuizIdAndCompletedAtIsNotNull(quizId);

        BigDecimal passRate = null;
        BigDecimal averageScore = null;
        Integer averageTime = null;

        if (completedAttempts > 0) {
            long passedCount = attemptRepository.countPassedAttemptsByQuizId(quizId);
            passRate = calculatePercentage(passedCount, completedAttempts);
            averageScore = attemptRepository.findAverageScoreByQuizId(quizId);
            Double avgTime = attemptRepository.findAverageTimeByQuizId(quizId);
            averageTime = avgTime != null ? avgTime.intValue() : null;
        }

        return new QuizAnalyticsSummaryResponse(
            quizId,
            quiz.getTitle(),
            totalAttempts,
            completedAttempts,
            passRate,
            averageScore != null ? averageScore.setScale(2, RoundingMode.HALF_UP) : null,
            averageTime
        );
    }

    private ScoreDistribution calculateScoreDistribution(List<BigDecimal> scores) {
        int[] buckets = new int[5];

        for (BigDecimal score : scores) {
            if (score == null) continue;
            int value = score.intValue();
            if (value <= 20) buckets[0]++;
            else if (value <= 40) buckets[1]++;
            else if (value <= 60) buckets[2]++;
            else if (value <= 80) buckets[3]++;
            else buckets[4]++;
        }

        return new ScoreDistribution(
            buckets[0], buckets[1], buckets[2], buckets[3], buckets[4]
        );
    }

    private List<QuestionAnalytics> buildQuestionAnalytics(UUID quizId) {
        // Get question stats from aggregation query
        List<Object[]> stats = answerRepository.findQuestionStatsByQuizId(quizId);

        // Get question details
        Map<UUID, Question> questionMap = questionRepository.findByQuizIdOrderByQuestionOrderAsc(quizId)
            .stream()
            .collect(Collectors.toMap(Question::getId, q -> q));

        List<QuestionAnalytics> analytics = new ArrayList<>();

        for (Object[] row : stats) {
            UUID questionId = (UUID) row[0];
            long totalAnswers = ((Number) row[1]).longValue();
            long correctAnswers = ((Number) row[2]).longValue();
            Double avgTime = row[3] != null ? ((Number) row[3]).doubleValue() : null;

            Question question = questionMap.get(questionId);
            if (question == null) continue;

            BigDecimal successRate = calculatePercentage(correctAnswers, totalAnswers);

            analytics.add(new QuestionAnalytics(
                questionId,
                question.getText(),
                question.getType().name(),
                question.getQuestionOrder(),
                totalAnswers,
                correctAnswers,
                successRate,
                avgTime != null ? avgTime.intValue() : null,
                question.getPoints() != null ? question.getPoints() : 1
            ));
        }

        // Sort by question order
        analytics.sort(Comparator.comparingInt(QuestionAnalytics::questionOrder));

        return analytics;
    }

    private List<TimeSeriesDataPoint> buildTimeSeries(UUID quizId, int days) {
        Instant startDate = Instant.now().minus(days, ChronoUnit.DAYS);
        List<Object[]> rawData = attemptRepository.findDailyAttemptStats(quizId, startDate);

        return rawData.stream()
            .map(row -> new TimeSeriesDataPoint(
                row[0].toString(),
                ((Number) row[1]).longValue(),
                ((Number) row[2]).longValue(),
                row[3] != null ? BigDecimal.valueOf(((Number) row[3]).doubleValue())
                    .setScale(2, RoundingMode.HALF_UP) : null
            ))
            .collect(Collectors.toList());
    }

    private BigDecimal calculatePercentage(long numerator, long denominator) {
        if (denominator == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(numerator * 100.0 / denominator)
            .setScale(2, RoundingMode.HALF_UP);
    }

    private Integer calculateMedian(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) return null;

        List<BigDecimal> nonNull = values.stream()
            .filter(Objects::nonNull)
            .sorted()
            .toList();

        if (nonNull.isEmpty()) return null;

        int middle = nonNull.size() / 2;
        if (nonNull.size() % 2 == 0) {
            return nonNull.get(middle - 1).add(nonNull.get(middle))
                .divide(BigDecimal.valueOf(2), RoundingMode.HALF_UP).intValue();
        }
        return nonNull.get(middle).intValue();
    }
}
