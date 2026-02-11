package io.froebel.backend.course.service;

import io.froebel.backend.course.dto.response.ProgressResponse;
import io.froebel.backend.course.exception.MaterialNotFoundException;
import io.froebel.backend.course.exception.NotEnrolledException;
import io.froebel.backend.model.entity.Enrollment;
import io.froebel.backend.model.entity.Lesson;
import io.froebel.backend.model.entity.MaterialProgress;
import io.froebel.backend.repository.EnrollmentRepository;
import io.froebel.backend.repository.MaterialProgressRepository;
import io.froebel.backend.repository.MaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final MaterialProgressRepository progressRepository;
    private final MaterialRepository materialRepository;
    private final EnrollmentRepository enrollmentRepository;

    public ProgressService(
        MaterialProgressRepository progressRepository,
        MaterialRepository materialRepository,
        EnrollmentRepository enrollmentRepository
    ) {
        this.progressRepository = progressRepository;
        this.materialRepository = materialRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public ProgressResponse getProgress(UUID courseId, UUID userId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
            .orElseThrow(() -> new NotEnrolledException(courseId, userId));

        List<Lesson> materials = materialRepository.findByCourseIdAndPublishedTrueOrderByLessonOrderAsc(courseId);
        List<MaterialProgress> progressList = progressRepository.findByEnrollmentId(enrollment.getId());

        Map<UUID, MaterialProgress> progressMap = progressList.stream()
            .collect(Collectors.toMap(p -> p.getMaterial().getId(), p -> p));

        int totalMaterials = materials.size();
        int completedMaterials = progressList.size();
        double progressPercentage = totalMaterials == 0 ? 0 : (completedMaterials * 100.0 / totalMaterials);

        List<ProgressResponse.MaterialProgressItem> materialProgressItems = materials.stream()
            .map(material -> {
                MaterialProgress progress = progressMap.get(material.getId());
                return new ProgressResponse.MaterialProgressItem(
                    material.getId(),
                    material.getTitle(),
                    material.getLessonOrder(),
                    progress != null,
                    progress != null ? progress.getCompletedAt() : null
                );
            })
            .collect(Collectors.toList());

        return new ProgressResponse(
            enrollment.getId(),
            courseId,
            enrollment.getCourse().getTitle(),
            progressPercentage,
            totalMaterials,
            completedMaterials,
            enrollment.getEnrolledAt(),
            enrollment.getCompletedAt(),
            materialProgressItems
        );
    }

    @Transactional
    public ProgressResponse markMaterialComplete(UUID courseId, UUID materialId, UUID userId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
            .orElseThrow(() -> new NotEnrolledException(courseId, userId));

        Lesson material = materialRepository.findByIdAndCourseId(materialId, courseId)
            .orElseThrow(() -> new MaterialNotFoundException(materialId, courseId));

        // Check if already completed
        if (!progressRepository.existsByEnrollmentIdAndMaterialId(enrollment.getId(), materialId)) {
            MaterialProgress progress = MaterialProgress.builder()
                .enrollment(enrollment)
                .material(material)
                .completedAt(Instant.now())
                .build();
            progressRepository.save(progress);

            // Check if all materials are completed
            checkAndMarkCourseComplete(enrollment, courseId);
        }

        return getProgress(courseId, userId);
    }

    @Transactional
    public ProgressResponse unmarkMaterialComplete(UUID courseId, UUID materialId, UUID userId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
            .orElseThrow(() -> new NotEnrolledException(courseId, userId));

        // Verify material exists in course
        materialRepository.findByIdAndCourseId(materialId, courseId)
            .orElseThrow(() -> new MaterialNotFoundException(materialId, courseId));

        progressRepository.deleteByEnrollmentIdAndMaterialId(enrollment.getId(), materialId);

        // Unmark course as complete if it was complete
        if (enrollment.getCompletedAt() != null) {
            enrollment.setCompletedAt(null);
            enrollmentRepository.save(enrollment);
        }

        return getProgress(courseId, userId);
    }

    private void checkAndMarkCourseComplete(Enrollment enrollment, UUID courseId) {
        long totalMaterials = materialRepository.countByCourseIdAndPublishedTrue(courseId);
        long completedMaterials = progressRepository.countByEnrollmentId(enrollment.getId());

        if (totalMaterials > 0 && completedMaterials >= totalMaterials) {
            enrollment.setCompletedAt(Instant.now());
            enrollmentRepository.save(enrollment);
        }
    }
}
