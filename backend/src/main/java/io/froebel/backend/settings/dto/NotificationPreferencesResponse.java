package io.froebel.backend.settings.dto;

import io.froebel.backend.model.entity.NotificationPreference;

public record NotificationPreferencesResponse(
    // Quiz Activity
    boolean quizCompleted,
    boolean quizResultsReady,

    // Course Activity
    boolean newEnrollment,
    boolean courseProgress,

    // Security Alerts
    boolean securityNewLogin,
    boolean securityPasswordChange,

    // Marketing & Digest
    boolean marketing,
    boolean weeklyDigest
) {
    public static NotificationPreferencesResponse from(NotificationPreference pref) {
        return new NotificationPreferencesResponse(
            pref.isQuizCompleted(),
            pref.isQuizResultsReady(),
            pref.isNewEnrollment(),
            pref.isCourseProgress(),
            pref.isSecurityNewLogin(),
            pref.isSecurityPasswordChange(),
            pref.isMarketing(),
            pref.isWeeklyDigest()
        );
    }

    public static NotificationPreferencesResponse defaults() {
        return new NotificationPreferencesResponse(
            true,  // quizCompleted
            true,  // quizResultsReady
            true,  // newEnrollment
            false, // courseProgress
            true,  // securityNewLogin
            true,  // securityPasswordChange
            true,  // marketing
            false  // weeklyDigest
        );
    }
}
