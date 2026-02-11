package io.froebel.backend.course.controller;

import io.froebel.backend.auth.security.UserPrincipal;
import io.froebel.backend.course.dto.request.CreateCourseRequest;
import io.froebel.backend.course.dto.request.UpdateCourseRequest;
import io.froebel.backend.course.dto.response.CourseDetailResponse;
import io.froebel.backend.course.dto.response.CourseResponse;
import io.froebel.backend.course.dto.response.CourseSummaryResponse;
import io.froebel.backend.course.dto.response.EnrollmentResponse;
import io.froebel.backend.course.dto.response.ProgressResponse;
import io.froebel.backend.course.dto.response.PublicCourseResponse;
import io.froebel.backend.course.service.CourseService;
import io.froebel.backend.course.service.EnrollmentService;
import io.froebel.backend.course.service.ProgressService;
import io.froebel.backend.model.enums.Difficulty;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseService courseService;
    private final EnrollmentService enrollmentService;
    private final ProgressService progressService;

    public CourseController(
        CourseService courseService,
        EnrollmentService enrollmentService,
        ProgressService progressService
    ) {
        this.courseService = courseService;
        this.enrollmentService = enrollmentService;
        this.progressService = progressService;
    }

    // ==================== Course CRUD ====================

    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody CreateCourseRequest request
    ) {
        CourseResponse response = courseService.createCourse(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<CourseSummaryResponse>> getMyCourses(
        @AuthenticationPrincipal UserPrincipal principal,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(courseService.getUserCourses(principal.getId(), pageable));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDetailResponse> getCourse(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId
    ) {
        return ResponseEntity.ok(courseService.getOwnedCourseDetail(courseId, principal.getId()));
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<CourseResponse> updateCourse(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @Valid @RequestBody UpdateCourseRequest request
    ) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, principal.getId(), request));
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId
    ) {
        courseService.deleteCourse(courseId, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{courseId}/publish")
    public ResponseEntity<CourseResponse> publishCourse(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @RequestParam boolean publish
    ) {
        return ResponseEntity.ok(courseService.publishCourse(courseId, principal.getId(), publish));
    }

    // ==================== Quiz Association ====================

    @PostMapping("/{courseId}/quizzes/{quizId}")
    public ResponseEntity<CourseResponse> attachQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @PathVariable UUID quizId
    ) {
        return ResponseEntity.ok(courseService.attachQuizToCourse(courseId, quizId, principal.getId()));
    }

    @DeleteMapping("/{courseId}/quizzes/{quizId}")
    public ResponseEntity<CourseResponse> detachQuiz(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @PathVariable UUID quizId
    ) {
        return ResponseEntity.ok(courseService.detachQuizFromCourse(courseId, quizId, principal.getId()));
    }

    // ==================== Public Endpoints ====================

    @GetMapping("/public")
    public ResponseEntity<Page<PublicCourseResponse>> getPublicCourses(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) UUID categoryId,
        @RequestParam(required = false) Difficulty difficulty,
        @RequestParam(required = false) Set<String> tags,
        @RequestParam(defaultValue = "newest") String sortBy,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(courseService.getFilteredPublicCourses(
            search, categoryId, difficulty, tags, sortBy, pageable));
    }

    @GetMapping("/public/{courseId}")
    public ResponseEntity<PublicCourseResponse> getPublicCourse(
        @PathVariable UUID courseId
    ) {
        return ResponseEntity.ok(courseService.getPublicCourseDetail(courseId));
    }

    @GetMapping("/public/difficulty/{difficulty}")
    public ResponseEntity<Page<PublicCourseResponse>> getPublicCoursesByDifficulty(
        @PathVariable Difficulty difficulty,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(courseService.getPublicCoursesByDifficulty(difficulty, pageable));
    }

    // ==================== Enrollment ====================

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<EnrollmentResponse> enroll(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId
    ) {
        EnrollmentResponse response = enrollmentService.enrollInCourse(courseId, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{courseId}/enroll")
    public ResponseEntity<Void> unenroll(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId
    ) {
        enrollmentService.unenrollFromCourse(courseId, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/enrolled")
    public ResponseEntity<Page<EnrollmentResponse>> getMyEnrollments(
        @AuthenticationPrincipal UserPrincipal principal,
        @PageableDefault(size = 20, sort = "enrolledAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(principal.getId(), pageable));
    }

    @GetMapping("/{courseId}/enrollments")
    public ResponseEntity<Page<EnrollmentResponse>> getCourseEnrollments(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @PageableDefault(size = 20, sort = "enrolledAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(enrollmentService.getCourseEnrollments(courseId, principal.getId(), pageable));
    }

    // ==================== Progress Tracking ====================

    @GetMapping("/{courseId}/progress")
    public ResponseEntity<ProgressResponse> getMyProgress(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId
    ) {
        return ResponseEntity.ok(progressService.getProgress(courseId, principal.getId()));
    }

    @PostMapping("/{courseId}/materials/{materialId}/complete")
    public ResponseEntity<ProgressResponse> markMaterialComplete(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @PathVariable UUID materialId
    ) {
        return ResponseEntity.ok(progressService.markMaterialComplete(courseId, materialId, principal.getId()));
    }

    @DeleteMapping("/{courseId}/materials/{materialId}/complete")
    public ResponseEntity<ProgressResponse> unmarkMaterialComplete(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID courseId,
        @PathVariable UUID materialId
    ) {
        return ResponseEntity.ok(progressService.unmarkMaterialComplete(courseId, materialId, principal.getId()));
    }
}
