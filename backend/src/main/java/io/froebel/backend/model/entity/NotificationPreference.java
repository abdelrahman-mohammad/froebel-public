package io.froebel.backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notification_preference")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Quiz Activity
    @Column(name = "quiz_completed", nullable = false)
    @Builder.Default
    private boolean quizCompleted = true;

    @Column(name = "quiz_results_ready", nullable = false)
    @Builder.Default
    private boolean quizResultsReady = true;

    // Course Activity
    @Column(name = "new_enrollment", nullable = false)
    @Builder.Default
    private boolean newEnrollment = true;

    @Column(name = "course_progress", nullable = false)
    @Builder.Default
    private boolean courseProgress = false;

    // Security Alerts
    @Column(name = "security_new_login", nullable = false)
    @Builder.Default
    private boolean securityNewLogin = true;

    @Column(name = "security_password_change", nullable = false)
    @Builder.Default
    private boolean securityPasswordChange = true;

    // Marketing & Digest
    @Column(nullable = false)
    @Builder.Default
    private boolean marketing = true;

    @Column(name = "weekly_digest", nullable = false)
    @Builder.Default
    private boolean weeklyDigest = false;
}
