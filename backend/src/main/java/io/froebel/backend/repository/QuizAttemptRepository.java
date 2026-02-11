package io.froebel.backend.repository;

import io.froebel.backend.model.entity.QuizAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {

    long countByUserId(UUID userId);

    long countByUserIdAndCompletedAtIsNotNull(UUID userId);

    // For attempt limiting
    long countByQuizIdAndIpAddress(UUID quizId, String ipAddress);

    long countByQuizIdAndAnonymousEmail(UUID quizId, String anonymousEmail);

    long countByQuizIdAndUserId(UUID quizId, UUID userId);

    // For finding attempts
    List<QuizAttempt> findByQuizIdAndUserId(UUID quizId, UUID userId);

    List<QuizAttempt> findByQuizIdAndIpAddress(UUID quizId, String ipAddress);

    Optional<QuizAttempt> findByIdAndUserId(UUID id, UUID userId);

    Optional<QuizAttempt> findByIdAndQuizId(UUID id, UUID quizId);

    // For quiz owner to see all attempts
    Page<QuizAttempt> findByQuizId(UUID quizId, Pageable pageable);

    List<QuizAttempt> findByQuizId(UUID quizId);

    // In-progress attempts (not completed)
    Optional<QuizAttempt> findByQuizIdAndUserIdAndCompletedAtIsNull(UUID quizId, UUID userId);

    Optional<QuizAttempt> findByQuizIdAndIpAddressAndCompletedAtIsNull(UUID quizId, String ipAddress);

    // Session-based anonymous attempt tracking (preferred over IP)
    Optional<QuizAttempt> findByQuizIdAndAnonymousSessionIdAndCompletedAtIsNull(UUID quizId, String anonymousSessionId);

    Optional<QuizAttempt> findByIdAndAnonymousSessionId(UUID id, String anonymousSessionId);

    long countByQuizIdAndAnonymousSessionId(UUID quizId, String anonymousSessionId);

    // ==================== Analytics Queries ====================

    long countByQuizId(UUID quizId);

    long countByQuizIdAndCompletedAtIsNotNull(UUID quizId);

    long countByQuizIdAndCompletedAtIsNull(UUID quizId);

    @Query("SELECT COUNT(a) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.completedAt IS NOT NULL AND a.passed = true")
    long countPassedAttemptsByQuizId(@Param("quizId") UUID quizId);

    @Query("SELECT AVG(a.percentage) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.completedAt IS NOT NULL")
    BigDecimal findAverageScoreByQuizId(@Param("quizId") UUID quizId);

    @Query("SELECT AVG(a.timeTakenSeconds) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.completedAt IS NOT NULL")
    Double findAverageTimeByQuizId(@Param("quizId") UUID quizId);

    @Query("SELECT a.percentage FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.completedAt IS NOT NULL")
    List<BigDecimal> findAllScoresByQuizId(@Param("quizId") UUID quizId);

    @Query("SELECT MIN(a.percentage) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.completedAt IS NOT NULL")
    Integer findMinScoreByQuizId(@Param("quizId") UUID quizId);

    @Query("SELECT MAX(a.percentage) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.completedAt IS NOT NULL")
    Integer findMaxScoreByQuizId(@Param("quizId") UUID quizId);

    @Query("SELECT MIN(a.timeTakenSeconds) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.completedAt IS NOT NULL")
    Integer findMinTimeByQuizId(@Param("quizId") UUID quizId);

    @Query("SELECT MAX(a.timeTakenSeconds) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.completedAt IS NOT NULL")
    Integer findMaxTimeByQuizId(@Param("quizId") UUID quizId);

    // Time series - daily attempts (PostgreSQL specific native query)
    @Query(value = """
        SELECT DATE(started_at) as date,
               COUNT(*) as attempt_count,
               COUNT(completed_at) as completed_count,
               AVG(CASE WHEN completed_at IS NOT NULL THEN percentage END) as avg_score
        FROM quiz_attempts
        WHERE quiz_id = :quizId
          AND started_at >= :startDate
        GROUP BY DATE(started_at)
        ORDER BY date ASC
        """, nativeQuery = true)
    List<Object[]> findDailyAttemptStats(@Param("quizId") UUID quizId, @Param("startDate") Instant startDate);
}
