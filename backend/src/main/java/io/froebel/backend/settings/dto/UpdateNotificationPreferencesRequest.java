package io.froebel.backend.settings.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationPreferencesRequest(
    // Quiz Activity
    @NotNull Boolean quizCompleted,
    @NotNull Boolean quizResultsReady,

    // Course Activity
    @NotNull Boolean newEnrollment,
    @NotNull Boolean courseProgress,

    // Security Alerts
    @NotNull Boolean securityNewLogin,
    @NotNull Boolean securityPasswordChange,

    // Marketing & Digest
    @NotNull Boolean marketing,
    @NotNull Boolean weeklyDigest
) {}
