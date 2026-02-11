package io.froebel.backend.course.service;

import io.froebel.backend.course.dto.request.CreateMaterialRequest;
import io.froebel.backend.course.dto.request.ReorderMaterialsRequest;
import io.froebel.backend.course.dto.request.UpdateMaterialRequest;
import io.froebel.backend.course.dto.response.MaterialResponse;
import io.froebel.backend.course.exception.MaterialNotFoundException;
import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.Course;
import io.froebel.backend.model.entity.Lesson;
import io.froebel.backend.model.entity.Media;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.repository.MaterialRepository;
import io.froebel.backend.repository.MediaRepository;
import io.froebel.backend.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final MediaRepository mediaRepository;
    private final QuizRepository quizRepository;
    private final CourseService courseService;

    public MaterialService(
        MaterialRepository materialRepository,
        MediaRepository mediaRepository,
        QuizRepository quizRepository,
        CourseService courseService
    ) {
        this.materialRepository = materialRepository;
        this.mediaRepository = mediaRepository;
        this.quizRepository = quizRepository;
        this.courseService = courseService;
    }

    @Transactional
    public MaterialResponse addMaterial(UUID courseId, UUID userId, CreateMaterialRequest request) {
        Course course = courseService.findOwnedCourse(courseId, userId);

        int maxOrder = materialRepository.findMaxMaterialOrderByCourseId(courseId);

        Lesson material = Lesson.builder()
            .course(course)
            .title(request.title())
            .contentType(request.contentType())
            .content(request.content())
            .fileId(request.fileId())
            .durationMinutes(request.durationMinutes())
            .lessonOrder(maxOrder + 1)
            .published(false)
            .build();

        // Add media attachments
        if (request.mediaIds() != null && !request.mediaIds().isEmpty()) {
            Set<Media> mediaSet = new HashSet<>();
            for (UUID mediaId : request.mediaIds()) {
                Media media = mediaRepository.findById(mediaId)
                    .orElseThrow(() -> new ResourceNotFoundException("Media", "id", mediaId));
                mediaSet.add(media);
            }
            material.setMedia(mediaSet);
        }

        material = materialRepository.save(material);
        return MaterialResponse.from(material);
    }

    public List<MaterialResponse> getMaterials(UUID courseId, UUID userId) {
        courseService.findOwnedCourse(courseId, userId);

        return materialRepository.findByCourseIdOrderByLessonOrderAsc(courseId).stream()
            .map(MaterialResponse::from)
            .collect(Collectors.toList());
    }

    public MaterialResponse getMaterial(UUID courseId, UUID materialId, UUID userId) {
        courseService.findOwnedCourse(courseId, userId);

        Lesson material = findMaterialByIdAndCourseId(materialId, courseId);
        return MaterialResponse.from(material);
    }

    @Transactional
    public MaterialResponse updateMaterial(UUID courseId, UUID materialId, UUID userId, UpdateMaterialRequest request) {
        courseService.findOwnedCourse(courseId, userId);

        Lesson material = findMaterialByIdAndCourseId(materialId, courseId);

        material.setTitle(request.title());
        material.setContentType(request.contentType());
        material.setContent(request.content());
        material.setFileId(request.fileId());
        material.setDurationMinutes(request.durationMinutes());

        // Update media attachments
        if (request.mediaIds() != null) {
            Set<Media> mediaSet = new HashSet<>();
            for (UUID mediaId : request.mediaIds()) {
                Media media = mediaRepository.findById(mediaId)
                    .orElseThrow(() -> new ResourceNotFoundException("Media", "id", mediaId));
                mediaSet.add(media);
            }
            material.setMedia(mediaSet);
        }

        material = materialRepository.save(material);
        return MaterialResponse.from(material);
    }

    @Transactional
    public void deleteMaterial(UUID courseId, UUID materialId, UUID userId) {
        courseService.findOwnedCourse(courseId, userId);

        Lesson material = findMaterialByIdAndCourseId(materialId, courseId);
        int deletedOrder = material.getLessonOrder();

        materialRepository.delete(material);

        // Reorder remaining materials
        reorderAfterDeletion(courseId, deletedOrder);
    }

    @Transactional
    public MaterialResponse publishMaterial(UUID courseId, UUID materialId, UUID userId, boolean publish) {
        courseService.findOwnedCourse(courseId, userId);

        Lesson material = findMaterialByIdAndCourseId(materialId, courseId);
        material.setPublished(publish);
        material = materialRepository.save(material);

        return MaterialResponse.from(material);
    }

    @Transactional
    public List<MaterialResponse> reorderMaterials(UUID courseId, UUID userId, ReorderMaterialsRequest request) {
        courseService.findOwnedCourse(courseId, userId);

        for (ReorderMaterialsRequest.MaterialOrderItem item : request.materialOrders()) {
            Lesson material = findMaterialByIdAndCourseId(item.materialId(), courseId);
            material.setLessonOrder(item.order());
            materialRepository.save(material);
        }

        return materialRepository.findByCourseIdOrderByLessonOrderAsc(courseId).stream()
            .map(MaterialResponse::from)
            .collect(Collectors.toList());
    }

    // ==================== Quiz Association ====================

    @Transactional
    public MaterialResponse attachQuizToMaterial(UUID courseId, UUID materialId, UUID quizId, UUID userId) {
        courseService.findOwnedCourse(courseId, userId);
        Lesson material = findMaterialByIdAndCourseId(materialId, courseId);

        Quiz quiz = quizRepository.findByIdAndCreatorId(quizId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));

        quiz.setLesson(material);
        quizRepository.save(quiz);

        // Refresh material to get updated quizzes list
        material = materialRepository.findById(materialId).orElseThrow();
        return MaterialResponse.from(material);
    }

    @Transactional
    public MaterialResponse detachQuizFromMaterial(UUID courseId, UUID materialId, UUID quizId, UUID userId) {
        courseService.findOwnedCourse(courseId, userId);
        Lesson material = findMaterialByIdAndCourseId(materialId, courseId);

        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));

        if (quiz.getLesson() != null && quiz.getLesson().getId().equals(materialId)) {
            quiz.setLesson(null);
            quizRepository.save(quiz);
        }

        // Refresh material to get updated quizzes list
        material = materialRepository.findById(materialId).orElseThrow();
        return MaterialResponse.from(material);
    }

    // ==================== Helper Methods ====================

    private Lesson findMaterialByIdAndCourseId(UUID materialId, UUID courseId) {
        return materialRepository.findByIdAndCourseId(materialId, courseId)
            .orElseThrow(() -> new MaterialNotFoundException(materialId, courseId));
    }

    private void reorderAfterDeletion(UUID courseId, int deletedOrder) {
        List<Lesson> materials = materialRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
        for (Lesson material : materials) {
            if (material.getLessonOrder() > deletedOrder) {
                material.setLessonOrder(material.getLessonOrder() - 1);
                materialRepository.save(material);
            }
        }
    }
}
