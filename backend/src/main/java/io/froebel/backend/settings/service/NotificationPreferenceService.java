package io.froebel.backend.settings.service;

import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.NotificationPreference;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.repository.NotificationPreferenceRepository;
import io.froebel.backend.repository.UserRepository;
import io.froebel.backend.settings.dto.NotificationPreferencesResponse;
import io.froebel.backend.settings.dto.UpdateNotificationPreferencesRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class NotificationPreferenceService {

    private static final Logger log = LoggerFactory.getLogger(NotificationPreferenceService.class);

    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final UserRepository userRepository;

    public NotificationPreferenceService(
        NotificationPreferenceRepository notificationPreferenceRepository,
        UserRepository userRepository
    ) {
        this.notificationPreferenceRepository = notificationPreferenceRepository;
        this.userRepository = userRepository;
    }

    public NotificationPreferencesResponse getPreferences(UUID userId) {
        return notificationPreferenceRepository.findByUserId(userId)
            .map(NotificationPreferencesResponse::from)
            .orElseGet(NotificationPreferencesResponse::defaults);
    }

    @Transactional
    public NotificationPreferencesResponse updatePreferences(UUID userId, UpdateNotificationPreferencesRequest request) {
        NotificationPreference pref = notificationPreferenceRepository.findByUserId(userId)
            .orElseGet(() -> createDefaultPreferences(userId));

        pref.setQuizCompleted(request.quizCompleted());
        pref.setQuizResultsReady(request.quizResultsReady());
        pref.setNewEnrollment(request.newEnrollment());
        pref.setCourseProgress(request.courseProgress());
        pref.setSecurityNewLogin(request.securityNewLogin());
        pref.setSecurityPasswordChange(request.securityPasswordChange());
        pref.setMarketing(request.marketing());
        pref.setWeeklyDigest(request.weeklyDigest());

        pref = notificationPreferenceRepository.save(pref);
        log.info("Updated notification preferences for user {}", userId);

        return NotificationPreferencesResponse.from(pref);
    }

    @Transactional
    public NotificationPreferencesResponse unsubscribeFromMarketing(UUID userId) {
        NotificationPreference pref = notificationPreferenceRepository.findByUserId(userId)
            .orElseGet(() -> createDefaultPreferences(userId));

        pref.setMarketing(false);
        pref.setWeeklyDigest(false);

        pref = notificationPreferenceRepository.save(pref);
        log.info("User {} unsubscribed from all marketing", userId);

        return NotificationPreferencesResponse.from(pref);
    }

    @Transactional
    public NotificationPreference createDefaultPreferences(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        NotificationPreference pref = NotificationPreference.builder()
            .user(user)
            .build();

        return notificationPreferenceRepository.save(pref);
    }

    public boolean shouldSendNotification(UUID userId, NotificationType type) {
        NotificationPreference pref = notificationPreferenceRepository.findByUserId(userId)
            .orElse(null);

        if (pref == null) {
            // Default behavior: send all notifications except courseProgress and weeklyDigest
            return type != NotificationType.COURSE_PROGRESS && type != NotificationType.WEEKLY_DIGEST;
        }

        return switch (type) {
            case QUIZ_COMPLETED -> pref.isQuizCompleted();
            case QUIZ_RESULTS_READY -> pref.isQuizResultsReady();
            case NEW_ENROLLMENT -> pref.isNewEnrollment();
            case COURSE_PROGRESS -> pref.isCourseProgress();
            case SECURITY_NEW_LOGIN -> pref.isSecurityNewLogin();
            case SECURITY_PASSWORD_CHANGE -> pref.isSecurityPasswordChange();
            case MARKETING -> pref.isMarketing();
            case WEEKLY_DIGEST -> pref.isWeeklyDigest();
        };
    }

    public enum NotificationType {
        QUIZ_COMPLETED,
        QUIZ_RESULTS_READY,
        NEW_ENROLLMENT,
        COURSE_PROGRESS,
        SECURITY_NEW_LOGIN,
        SECURITY_PASSWORD_CHANGE,
        MARKETING,
        WEEKLY_DIGEST
    }
}
