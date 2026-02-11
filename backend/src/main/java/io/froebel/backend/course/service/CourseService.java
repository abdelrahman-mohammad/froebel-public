package io.froebel.backend.course.service;

import io.froebel.backend.course.dto.request.CreateCourseRequest;
import io.froebel.backend.course.dto.request.UpdateCourseRequest;
import io.froebel.backend.course.dto.response.CourseDetailResponse;
import io.froebel.backend.course.dto.response.CourseResponse;
import io.froebel.backend.course.dto.response.CourseSummaryResponse;
import io.froebel.backend.course.dto.response.PublicCourseResponse;
import io.froebel.backend.course.exception.CourseAccessDeniedException;
import io.froebel.backend.course.exception.CourseNotPublishedException;
import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.Course;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.entity.Tag;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.enums.Difficulty;
import io.froebel.backend.repository.CategoryRepository;
import io.froebel.backend.repository.CourseRepository;
import io.froebel.backend.repository.QuizRepository;
import io.froebel.backend.repository.TagRepository;
import io.froebel.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final QuizRepository quizRepository;

    public CourseService(
        CourseRepository courseRepository,
        UserRepository userRepository,
        CategoryRepository categoryRepository,
        TagRepository tagRepository,
        QuizRepository quizRepository
    ) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.quizRepository = quizRepository;
    }

    @Transactional
    public CourseResponse createCourse(UUID userId, CreateCourseRequest request) {
        User creator = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Course course = Course.builder()
            .title(request.title())
            .description(request.description())
            .imageUrl(request.imageUrl())
            .creator(creator)
            .difficulty(request.difficulty())
            .estimatedHours(request.estimatedHours())
            .published(false)
            .build();

        // Set category if provided
        if (request.categoryId() != null) {
            course.setCategory(categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId())));
        }

        // Handle tags
        if (request.tagNames() != null && !request.tagNames().isEmpty()) {
            Set<Tag> tags = getOrCreateTags(request.tagNames());
            course.setTags(tags);
        }

        course = courseRepository.save(course);
        return CourseResponse.from(course);
    }

    public Page<CourseSummaryResponse> getUserCourses(UUID userId, Pageable pageable) {
        return courseRepository.findByCreatorId(userId, pageable)
            .map(CourseSummaryResponse::from);
    }

    public CourseDetailResponse getCourseDetail(UUID courseId, UUID userId) {
        Course course = findCourseById(courseId);

        // Check access: owner or published
        if (!course.getCreator().getId().equals(userId) && !course.isPublished()) {
            throw new CourseAccessDeniedException(courseId, userId);
        }

        return CourseDetailResponse.from(course);
    }

    public CourseDetailResponse getOwnedCourseDetail(UUID courseId, UUID userId) {
        Course course = findOwnedCourse(courseId, userId);
        return CourseDetailResponse.from(course);
    }

    @Transactional
    public CourseResponse updateCourse(UUID courseId, UUID userId, UpdateCourseRequest request) {
        Course course = findOwnedCourse(courseId, userId);

        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setImageUrl(request.imageUrl());
        course.setDifficulty(request.difficulty());
        course.setEstimatedHours(request.estimatedHours());

        // Update category
        if (request.categoryId() != null) {
            course.setCategory(categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId())));
        } else {
            course.setCategory(null);
        }

        // Update tags
        if (request.tagNames() != null) {
            Set<Tag> tags = getOrCreateTags(request.tagNames());
            course.setTags(tags);
        }

        course = courseRepository.save(course);
        return CourseResponse.from(course);
    }

    @Transactional
    public CourseResponse publishCourse(UUID courseId, UUID userId, boolean publish) {
        Course course = findOwnedCourse(courseId, userId);
        course.setPublished(publish);
        course = courseRepository.save(course);
        return CourseResponse.from(course);
    }

    @Transactional
    public void deleteCourse(UUID courseId, UUID userId) {
        Course course = findOwnedCourse(courseId, userId);
        courseRepository.delete(course);
    }

    // ==================== Public Browsing ====================

    public Page<PublicCourseResponse> getPublicCourses(Pageable pageable) {
        return courseRepository.findByPublishedTrue(pageable)
            .map(PublicCourseResponse::from);
    }

    public Page<PublicCourseResponse> getPublicCoursesByDifficulty(Difficulty difficulty, Pageable pageable) {
        return courseRepository.findByPublishedTrueAndDifficulty(difficulty, pageable)
            .map(PublicCourseResponse::from);
    }

    public Page<PublicCourseResponse> getFilteredPublicCourses(
        String search,
        UUID categoryId,
        Difficulty difficulty,
        Set<String> tags,
        String sortBy,
        Pageable pageable) {
        // Build sort from sortBy parameter
        Sort sort = buildSort(sortBy);
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            sort
        );

        // Convert tags to slugs
        Set<String> tagSlugs = tags != null && !tags.isEmpty() ? tags : null;

        return courseRepository.searchPublishedCoursesWithFilters(
            search,
            categoryId,
            difficulty,
            tagSlugs,
            sortedPageable
        ).map(PublicCourseResponse::from);
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sortBy) {
            case "popular" -> Sort.by(Sort.Direction.DESC, "enrollmentCount");
            case "updated" -> Sort.by(Sort.Direction.DESC, "updatedAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt"); // "newest"
        };
    }

    public PublicCourseResponse getPublicCourseDetail(UUID courseId) {
        Course course = findCourseById(courseId);

        if (!course.isPublished()) {
            throw new CourseNotPublishedException(courseId);
        }

        return PublicCourseResponse.from(course);
    }

    // ==================== Quiz Association ====================

    @Transactional
    public CourseResponse attachQuizToCourse(UUID courseId, UUID quizId, UUID userId) {
        Course course = findOwnedCourse(courseId, userId);
        Quiz quiz = quizRepository.findByIdAndCreatorId(quizId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));

        quiz.setCourse(course);
        quizRepository.save(quiz);

        return CourseResponse.from(course);
    }

    @Transactional
    public CourseResponse detachQuizFromCourse(UUID courseId, UUID quizId, UUID userId) {
        Course course = findOwnedCourse(courseId, userId);
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));

        if (quiz.getCourse() != null && quiz.getCourse().getId().equals(courseId)) {
            quiz.setCourse(null);
            quizRepository.save(quiz);
        }

        return CourseResponse.from(course);
    }

    // ==================== Helper Methods ====================

    public Course findCourseById(UUID courseId) {
        return courseRepository.findById(courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
    }

    public Course findOwnedCourse(UUID courseId, UUID userId) {
        return courseRepository.findByIdAndCreatorId(courseId, userId)
            .orElseThrow(() -> new CourseAccessDeniedException(courseId, userId));
    }

    private Set<Tag> getOrCreateTags(Set<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        for (String name : tagNames) {
            String normalizedName = name.trim().toLowerCase();
            Tag tag = tagRepository.findByName(normalizedName)
                .orElseGet(() -> {
                    Tag newTag = Tag.builder()
                        .name(normalizedName)
                        .slug(normalizedName.replace(" ", "-"))
                        .build();
                    return tagRepository.save(newTag);
                });
            tags.add(tag);
        }
        return tags;
    }
}
