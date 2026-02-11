package io.froebel.backend.search.dto;

import io.froebel.backend.model.entity.Course;
import io.froebel.backend.model.entity.Tag;
import io.froebel.backend.model.enums.Difficulty;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record SearchCourseItem(
    UUID id,
    String title,
    String description,
    String imageUrl,
    String creatorName,
    Difficulty difficulty,
    int lessonCount,
    Set<String> tags
) {
    public static SearchCourseItem from(Course course) {
        return new SearchCourseItem(
            course.getId(),
            course.getTitle(),
            course.getDescription(),
            course.getImageUrl(),
            course.getCreator().getDisplayName(),
            course.getDifficulty(),
            course.getLessons().size(),
            course.getTags().stream().map(Tag::getName).collect(Collectors.toSet())
        );
    }
}
