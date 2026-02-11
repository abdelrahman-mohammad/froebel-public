package io.froebel.backend.course.dto.response;

import io.froebel.backend.model.entity.Course;
import io.froebel.backend.model.entity.Lesson;
import io.froebel.backend.model.enums.Difficulty;
import io.froebel.backend.quiz.dto.response.QuizSummaryResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record CourseDetailResponse(
    UUID id,
    String title,
    String description,
    String imageUrl,
    UUID creatorId,
    String creatorDisplayName,
    UUID categoryId,
    String categoryName,
    boolean published,
    Difficulty difficulty,
    BigDecimal estimatedHours,
    List<MaterialResponse> materials,
    List<QuizSummaryResponse> quizzes,
    int totalDurationMinutes,
    Set<String> tags,
    Instant createdAt,
    Instant updatedAt
) {
    public static CourseDetailResponse from(Course course) {
        List<MaterialResponse> materialResponses = course.getLessons().stream()
            .map(MaterialResponse::from)
            .collect(Collectors.toList());

        List<QuizSummaryResponse> quizResponses = course.getQuizzes().stream()
            .map(QuizSummaryResponse::from)
            .collect(Collectors.toList());

        int totalDuration = course.getLessons().stream()
            .filter(l -> l.getDurationMinutes() != null)
            .mapToInt(Lesson::getDurationMinutes)
            .sum();

        Set<String> tagNames = course.getTags().stream()
            .map(tag -> tag.getName())
            .collect(Collectors.toSet());

        return new CourseDetailResponse(
            course.getId(),
            course.getTitle(),
            course.getDescription(),
            course.getImageUrl(),
            course.getCreator().getId(),
            course.getCreator().getDisplayName(),
            course.getCategory() != null ? course.getCategory().getId() : null,
            course.getCategory() != null ? course.getCategory().getName() : null,
            course.isPublished(),
            course.getDifficulty(),
            course.getEstimatedHours(),
            materialResponses,
            quizResponses,
            totalDuration,
            tagNames,
            course.getCreatedAt(),
            course.getUpdatedAt()
        );
    }
}
