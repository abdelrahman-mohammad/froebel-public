package io.froebel.backend.course.dto.response;

import io.froebel.backend.model.entity.Course;
import io.froebel.backend.model.entity.Lesson;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.enums.Difficulty;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record PublicCourseResponse(
    UUID id,
    String title,
    String description,
    String imageUrl,
    String creatorDisplayName,
    String categoryName,
    Difficulty difficulty,
    BigDecimal estimatedHours,
    int materialCount,
    int quizCount,
    int totalDurationMinutes,
    Set<String> tags,
    Instant createdAt
) {
    public static PublicCourseResponse from(Course course) {
        int publishedMaterialCount = (int) course.getLessons().stream()
            .filter(Lesson::isPublished)
            .count();

        int totalDuration = course.getLessons().stream()
            .filter(Lesson::isPublished)
            .filter(l -> l.getDurationMinutes() != null)
            .mapToInt(Lesson::getDurationMinutes)
            .sum();

        int publishedQuizCount = (int) course.getQuizzes().stream()
            .filter(Quiz::isPublished)
            .count();

        Set<String> tagNames = course.getTags().stream()
            .map(tag -> tag.getName())
            .collect(Collectors.toSet());

        return new PublicCourseResponse(
            course.getId(),
            course.getTitle(),
            course.getDescription(),
            course.getImageUrl(),
            course.getCreator().getDisplayName(),
            course.getCategory() != null ? course.getCategory().getName() : null,
            course.getDifficulty(),
            course.getEstimatedHours(),
            publishedMaterialCount,
            publishedQuizCount,
            totalDuration,
            tagNames,
            course.getCreatedAt()
        );
    }
}
