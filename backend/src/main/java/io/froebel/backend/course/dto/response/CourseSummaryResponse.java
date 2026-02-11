package io.froebel.backend.course.dto.response;

import io.froebel.backend.model.entity.Course;
import io.froebel.backend.model.enums.Difficulty;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record CourseSummaryResponse(
    UUID id,
    String title,
    String description,
    String imageUrl,
    UUID creatorId,
    String creatorDisplayName,
    boolean published,
    Difficulty difficulty,
    BigDecimal estimatedHours,
    int materialCount,
    int quizCount,
    Set<String> tags,
    Instant createdAt,
    Instant updatedAt
) {
    public static CourseSummaryResponse from(Course course) {
        Set<String> tagNames = course.getTags().stream()
            .map(tag -> tag.getName())
            .collect(Collectors.toSet());

        return new CourseSummaryResponse(
            course.getId(),
            course.getTitle(),
            course.getDescription(),
            course.getImageUrl(),
            course.getCreator().getId(),
            course.getCreator().getDisplayName(),
            course.isPublished(),
            course.getDifficulty(),
            course.getEstimatedHours(),
            course.getLessons().size(),
            course.getQuizzes().size(),
            tagNames,
            course.getCreatedAt(),
            course.getUpdatedAt()
        );
    }
}
