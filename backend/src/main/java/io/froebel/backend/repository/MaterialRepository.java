package io.froebel.backend.repository;

import io.froebel.backend.model.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaterialRepository extends JpaRepository<Lesson, UUID> {

    List<Lesson> findByCourseId(UUID courseId);

    List<Lesson> findByCourseIdOrderByLessonOrderAsc(UUID courseId);

    Optional<Lesson> findByIdAndCourseId(UUID id, UUID courseId);

    @Query("SELECT COALESCE(MAX(l.lessonOrder), -1) FROM Lesson l WHERE l.course.id = :courseId")
    int findMaxMaterialOrderByCourseId(@Param("courseId") UUID courseId);

    long countByCourseId(UUID courseId);

    long countByCourseIdAndPublishedTrue(UUID courseId);

    void deleteByCourseId(UUID courseId);

    List<Lesson> findByCourseIdAndPublishedTrue(UUID courseId);

    List<Lesson> findByCourseIdAndPublishedTrueOrderByLessonOrderAsc(UUID courseId);
}
