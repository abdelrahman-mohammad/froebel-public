package io.froebel.backend.repository;

import io.froebel.backend.model.entity.QuizHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizHistoryRepository extends JpaRepository<QuizHistory, UUID> {

    /**
     * Find all history entries for a quiz, ordered by version descending (newest first).
     */
    List<QuizHistory> findByQuizIdOrderByVersionNumberDesc(UUID quizId);

    /**
     * Find history entries with pagination.
     */
    Page<QuizHistory> findByQuizId(UUID quizId, Pageable pageable);

    /**
     * Find a specific version of a quiz.
     */
    Optional<QuizHistory> findByQuizIdAndVersionNumber(UUID quizId, Integer versionNumber);

    /**
     * Get the latest version number for a quiz.
     * Returns null if no history exists.
     */
    @Query("SELECT MAX(h.versionNumber) FROM QuizHistory h WHERE h.quiz.id = :quizId")
    Integer findMaxVersionNumberByQuizId(@Param("quizId") UUID quizId);

    /**
     * Count total versions for a quiz.
     */
    long countByQuizId(UUID quizId);

    /**
     * Delete all history for a quiz (used when quiz is deleted - handled by CASCADE).
     */
    void deleteByQuizId(UUID quizId);

    /**
     * Batch fetch published snapshots for multiple quizzes.
     * Returns history entries where versionNumber matches the quiz's publishedVersionNumber.
     * Uses JOIN FETCH to eagerly load quiz to avoid N+1 queries when mapping results.
     */
    @Query("SELECT h FROM QuizHistory h JOIN FETCH h.quiz WHERE h.quiz.id IN :quizIds AND h.versionNumber = h.quiz.publishedVersionNumber")
    List<QuizHistory> findPublishedSnapshotsByQuizIds(@Param("quizIds") Collection<UUID> quizIds);
}
