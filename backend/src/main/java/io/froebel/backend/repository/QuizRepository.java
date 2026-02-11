package io.froebel.backend.repository;

import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.enums.QuizStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {

    List<Quiz> findByCreator(User creator);

    List<Quiz> findByCreatorId(UUID creatorId);

    Page<Quiz> findByCreatorId(UUID creatorId, Pageable pageable);

    Optional<Quiz> findByIdAndCreatorId(UUID id, UUID creatorId);

    List<Quiz> findByCourseId(UUID courseId);

    List<Quiz> findByStatus(QuizStatus status);

    // Public quizzes for taking (published + public)
    Page<Quiz> findByStatusAndIsPublicTrue(QuizStatus status, Pageable pageable);

    List<Quiz> findByCourseIsNull();

    long countByCreatorId(UUID creatorId);

    // Search public quizzes by title or description (case-insensitive)
    @Query("SELECT q FROM Quiz q WHERE q.status = :status AND q.isPublic = true " +
        "AND (LOWER(q.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
        "OR LOWER(q.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Quiz> searchPublicQuizzes(@Param("status") QuizStatus status, @Param("query") String query, Pageable pageable);

    // Search public quizzes with optional filters (category, tags, search)
    @Query("SELECT DISTINCT q FROM Quiz q " +
        "LEFT JOIN q.tags t " +
        "WHERE q.status = :status AND q.isPublic = true " +
        "AND (:query IS NULL OR :query = '' OR LOWER(q.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
        "    OR LOWER(q.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
        "AND (:categoryId IS NULL OR q.category.id = :categoryId) " +
        "AND (:tagSlugs IS NULL OR t.slug IN :tagSlugs)")
    Page<Quiz> searchPublicQuizzesWithFilters(
        @Param("status") QuizStatus status,
        @Param("query") String query,
        @Param("categoryId") UUID categoryId,
        @Param("tagSlugs") Set<String> tagSlugs,
        Pageable pageable);

    // Find public quizzes by category
    Page<Quiz> findByStatusAndIsPublicTrueAndCategoryId(QuizStatus status, UUID categoryId, Pageable pageable);

    // EntityGraph methods for eager loading to avoid N+1 queries
    @EntityGraph("Quiz.withDetails")
    Optional<Quiz> findWithDetailsById(UUID id);

    @EntityGraph("Quiz.withDetails")
    Optional<Quiz> findWithDetailsByIdAndCreatorId(UUID id, UUID creatorId);

    // Note: Don't use EntityGraph with pagination - it causes in-memory pagination (HHH90003004)
    // For list views, use the non-EntityGraph methods and let Hibernate batch-fetch as needed
    // Page<Quiz> findWithDetailsByCreatorId - REMOVED (use findByCreatorId instead)
    // Page<Quiz> findWithDetailsByStatusAndIsPublicTrue - REMOVED (use findByStatusAndIsPublicTrue instead)

    // Shareable ID lookup methods
    Optional<Quiz> findByShareableId(String shareableId);

    @EntityGraph("Quiz.withDetails")
    Optional<Quiz> findWithDetailsByShareableId(String shareableId);

    @EntityGraph("Quiz.withDetails")
    Optional<Quiz> findWithDetailsByShareableIdAndCreatorId(String shareableId, UUID creatorId);

    boolean existsByShareableId(String shareableId);

    // Anonymize quizzes by setting creator to null (used for account deletion)
    @Modifying
    @Query("UPDATE Quiz q SET q.creator = null WHERE q.creator.id = :creatorId")
    int anonymizeByCreatorId(@Param("creatorId") UUID creatorId);
}
