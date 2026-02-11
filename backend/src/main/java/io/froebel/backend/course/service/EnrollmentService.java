package io.froebel.backend.course.service;

import io.froebel.backend.course.dto.response.EnrollmentResponse;
import io.froebel.backend.course.exception.AlreadyEnrolledException;
import io.froebel.backend.course.exception.CourseNotPublishedException;
import io.froebel.backend.course.exception.NotEnrolledException;
import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.Course;
import io.froebel.backend.model.entity.Enrollment;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.repository.CourseRepository;
import io.froebel.backend.repository.EnrollmentRepository;
import io.froebel.backend.repository.MaterialProgressRepository;
import io.froebel.backend.repository.MaterialRepository;
import io.froebel.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final MaterialRepository materialRepository;
    private final MaterialProgressRepository progressRepository;

    public EnrollmentService(
        EnrollmentRepository enrollmentRepository,
        CourseRepository courseRepository,
        UserRepository userRepository,
        MaterialRepository materialRepository,
        MaterialProgressRepository progressRepository
    ) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.materialRepository = materialRepository;
        this.progressRepository = progressRepository;
    }

    @Transactional
    public EnrollmentResponse enrollInCourse(UUID courseId, UUID userId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        if (!course.isPublished()) {
            throw new CourseNotPublishedException(courseId);
        }

        // Check if already enrolled
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new AlreadyEnrolledException(courseId, userId);
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Enrollment enrollment = Enrollment.builder()
            .user(user)
            .course(course)
            .enrolledAt(Instant.now())
            .build();

        enrollment = enrollmentRepository.save(enrollment);
        return toEnrollmentResponse(enrollment);
    }

    @Transactional
    public void unenrollFromCourse(UUID courseId, UUID userId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
            .orElseThrow(() -> new NotEnrolledException(courseId, userId));

        // Delete all progress records
        progressRepository.deleteByEnrollmentId(enrollment.getId());

        enrollmentRepository.delete(enrollment);
    }

    public Page<EnrollmentResponse> getMyEnrollments(UUID userId, Pageable pageable) {
        return enrollmentRepository.findByUserId(userId, pageable)
            .map(this::toEnrollmentResponse);
    }

    public Page<EnrollmentResponse> getCourseEnrollments(UUID courseId, UUID userId, Pageable pageable) {
        // Verify user owns the course
        courseRepository.findByIdAndCreatorId(courseId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        return enrollmentRepository.findByCourseId(courseId, pageable)
            .map(this::toEnrollmentResponse);
    }

    public Enrollment findEnrollment(UUID courseId, UUID userId) {
        return enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
            .orElseThrow(() -> new NotEnrolledException(courseId, userId));
    }

    public boolean isEnrolled(UUID courseId, UUID userId) {
        return enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    private EnrollmentResponse toEnrollmentResponse(Enrollment enrollment) {
        Course course = enrollment.getCourse();

        long totalMaterials = materialRepository.countByCourseIdAndPublishedTrue(course.getId());
        long completedMaterials = progressRepository.countByEnrollmentId(enrollment.getId());
        double progressPercentage = totalMaterials == 0 ? 0 : (completedMaterials * 100.0 / totalMaterials);

        return new EnrollmentResponse(
            enrollment.getId(),
            course.getId(),
            course.getTitle(),
            course.getDescription(),
            course.getImageUrl(),
            course.getCreator().getDisplayName(),
            course.getDifficulty(),
            course.getEstimatedHours(),
            (int) totalMaterials,
            course.getQuizzes().size(),
            course.getTags().stream().map(t -> t.getName()).collect(Collectors.toSet()),
            enrollment.getEnrolledAt(),
            enrollment.getCompletedAt(),
            progressPercentage,
            (int) completedMaterials
        );
    }
}
