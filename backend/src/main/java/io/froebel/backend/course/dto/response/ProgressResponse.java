package io.froebel.backend.course.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProgressResponse(
    UUID enrollmentId,
    UUID courseId,
    String courseTitle,
    double progressPercentage,
    int totalMaterials,
    int completedMaterials,
    Instant enrolledAt,
    Instant completedAt,
    List<MaterialProgressItem> materialProgress
) {
    public record MaterialProgressItem(
        UUID materialId,
        String materialTitle,
        Integer materialOrder,
        boolean completed,
        Instant completedAt
    ) {
    }
}
