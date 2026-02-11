package io.froebel.backend.repository;

import io.froebel.backend.model.entity.MaterialProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaterialProgressRepository extends JpaRepository<MaterialProgress, UUID> {

    Optional<MaterialProgress> findByEnrollmentIdAndMaterialId(UUID enrollmentId, UUID materialId);

    boolean existsByEnrollmentIdAndMaterialId(UUID enrollmentId, UUID materialId);

    List<MaterialProgress> findByEnrollmentId(UUID enrollmentId);

    long countByEnrollmentId(UUID enrollmentId);

    void deleteByEnrollmentIdAndMaterialId(UUID enrollmentId, UUID materialId);

    void deleteByEnrollmentId(UUID enrollmentId);

    @Query("SELECT mp FROM MaterialProgress mp WHERE mp.enrollment.user.id = :userId AND mp.material.course.id = :courseId")
    List<MaterialProgress> findByUserIdAndCourseId(@Param("userId") UUID userId, @Param("courseId") UUID courseId);
}
