package io.froebel.backend.repository;

import io.froebel.backend.model.entity.Course;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.enums.Difficulty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
public interface CourseRepository extends JpaRepository<Course, UUID> {

    List<Course> findByCreator(User creator);

    List<Course> findByCreatorId(UUID creatorId);

    Page<Course> findByCreatorId(UUID creatorId, Pageable pageable);

    Optional<Course> findByIdAndCreatorId(UUID id, UUID creatorId);

    List<Course> findByPublishedTrue();

    Page<Course> findByPublishedTrue(Pageable pageable);

    Page<Course> findByPublishedTrueAndCategorySlug(String categorySlug, Pageable pageable);

    Page<Course> findByPublishedTrueAndDifficulty(Difficulty difficulty, Pageable pageable);

    long countByCreatorId(UUID creatorId);

    // Search published courses by title or description (case-insensitive)
    @Query("SELECT c FROM Course c WHERE c.published = true " +
        "AND (LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
        "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Course> searchPublishedCourses(@Param("query") String query, Pageable pageable);

    // Search published courses with optional filters (category, tags, difficulty, search)
    @Query("SELECT DISTINCT c FROM Course c " +
        "LEFT JOIN c.tags t " +
        "WHERE c.published = true " +
        "AND (:query IS NULL OR :query = '' OR LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
        "    OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
        "AND (:categoryId IS NULL OR c.category.id = :categoryId) " +
        "AND (:difficulty IS NULL OR c.difficulty = :difficulty) " +
        "AND (:tagSlugs IS NULL OR t.slug IN :tagSlugs)")
    Page<Course> searchPublishedCoursesWithFilters(
        @Param("query") String query,
        @Param("categoryId") UUID categoryId,
        @Param("difficulty") Difficulty difficulty,
        @Param("tagSlugs") Set<String> tagSlugs,
        Pageable pageable);

    // Anonymize courses by setting creator to null (used for account deletion)
    @Modifying
    @Query("UPDATE Course c SET c.creator = null WHERE c.creator.id = :creatorId")
    int anonymizeByCreatorId(@Param("creatorId") UUID creatorId);
}
