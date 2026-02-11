package io.froebel.backend.course.dto.response;

import io.froebel.backend.model.enums.Difficulty;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record EnrollmentResponse(
    UUID enrollmentId,
    UUID courseId,
    String courseTitle,
    String courseDescription,
    String courseImageUrl,
    String creatorDisplayName,
    Difficulty difficulty,
    BigDecimal estimatedHours,
    int materialCount,
    int quizCount,
    Set<String> tags,
    Instant enrolledAt,
    Instant completedAt,
    double progressPercentage,
    int completedMaterials
) {
}
