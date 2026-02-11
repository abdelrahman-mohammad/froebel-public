package io.froebel.backend.repository;

import io.froebel.backend.model.entity.Enrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    Optional<Enrollment> findByUserIdAndCourseId(UUID userId, UUID courseId);

    boolean existsByUserIdAndCourseId(UUID userId, UUID courseId);

    List<Enrollment> findByUserId(UUID userId);

    Page<Enrollment> findByUserId(UUID userId, Pageable pageable);

    List<Enrollment> findByCourseId(UUID courseId);

    Page<Enrollment> findByCourseId(UUID courseId, Pageable pageable);

    long countByCourseId(UUID courseId);

    long countByUserId(UUID userId);

    void deleteByUserIdAndCourseId(UUID userId, UUID courseId);
}
