package io.froebel.backend.course.dto.response;

import io.froebel.backend.model.entity.Lesson;
import io.froebel.backend.model.entity.Media;
import io.froebel.backend.model.enums.MaterialContentType;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record MaterialResponse(
    UUID id,
    UUID courseId,
    String title,
    MaterialContentType contentType,
    String content,
    UUID fileId,
    Integer materialOrder,
    Integer durationMinutes,
    boolean published,
    int quizCount,
    Set<UUID> mediaIds,
    Instant createdAt,
    Instant updatedAt
) {
    public static MaterialResponse from(Lesson lesson) {
        Set<UUID> mediaIds = lesson.getMedia().stream()
            .map(Media::getId)
            .collect(Collectors.toSet());

        return new MaterialResponse(
            lesson.getId(),
            lesson.getCourse().getId(),
            lesson.getTitle(),
            lesson.getContentType(),
            lesson.getContent(),
            lesson.getFileId(),
            lesson.getLessonOrder(),
            lesson.getDurationMinutes(),
            lesson.isPublished(),
            lesson.getQuizzes().size(),
            mediaIds,
            lesson.getCreatedAt(),
            lesson.getUpdatedAt()
        );
    }
}
