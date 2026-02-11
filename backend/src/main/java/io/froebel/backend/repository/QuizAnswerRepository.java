package io.froebel.backend.repository;

import io.froebel.backend.model.entity.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, UUID> {

    List<QuizAnswer> findByAttemptId(UUID attemptId);

    List<QuizAnswer> findByAttemptIdOrderByAnsweredAtAsc(UUID attemptId);

    Optional<QuizAnswer> findByAttemptIdAndQuestionId(UUID attemptId, UUID questionId);

    void deleteByAttemptId(UUID attemptId);

    long countByAttemptId(UUID attemptId);

    // ==================== Analytics Queries ====================

    @Query("""
        SELECT qa.question.id,
               COUNT(qa),
               SUM(CASE WHEN qa.isCorrect = true THEN 1 ELSE 0 END),
               AVG(qa.timeTakenSeconds)
        FROM QuizAnswer qa
        WHERE qa.question.quiz.id = :quizId
          AND qa.attempt.completedAt IS NOT NULL
        GROUP BY qa.question.id
        """)
    List<Object[]> findQuestionStatsByQuizId(@Param("quizId") UUID quizId);
}
