package io.froebel.backend.auth.service;

import io.froebel.backend.config.AppProperties;
import io.froebel.backend.model.entity.LoginAttempt;
import io.froebel.backend.repository.LoginAttemptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

/**
 * Service for tracking login attempts and implementing account lockout.
 */
@Service
public class LoginAttemptService {

    private static final Logger log = LoggerFactory.getLogger(LoginAttemptService.class);

    // Default values if not configured
    private static final int DEFAULT_MAX_ATTEMPTS = 5;
    private static final Duration DEFAULT_LOCKOUT_DURATION = Duration.ofMinutes(15);
    private static final Duration DEFAULT_ATTEMPT_WINDOW = Duration.ofMinutes(15);

    private final LoginAttemptRepository loginAttemptRepository;
    private final EmailService emailService;
    private final int maxAttempts;
    private final Duration lockoutDuration;
    private final Duration attemptWindow;

    public LoginAttemptService(
        LoginAttemptRepository loginAttemptRepository,
        EmailService emailService,
        AppProperties appProperties
    ) {
        this.loginAttemptRepository = loginAttemptRepository;
        this.emailService = emailService;

        // Get configuration from properties or use defaults
        AppProperties.SecurityConfig security = appProperties.getSecurity();
        if (security != null) {
            this.maxAttempts = security.getMaxLoginAttempts() > 0
                ? security.getMaxLoginAttempts()
                : DEFAULT_MAX_ATTEMPTS;
            this.lockoutDuration = security.getLockoutDurationMinutes() > 0
                ? Duration.ofMinutes(security.getLockoutDurationMinutes())
                : DEFAULT_LOCKOUT_DURATION;
            this.attemptWindow = security.getAttemptWindowMinutes() > 0
                ? Duration.ofMinutes(security.getAttemptWindowMinutes())
                : DEFAULT_ATTEMPT_WINDOW;
        } else {
            this.maxAttempts = DEFAULT_MAX_ATTEMPTS;
            this.lockoutDuration = DEFAULT_LOCKOUT_DURATION;
            this.attemptWindow = DEFAULT_ATTEMPT_WINDOW;
        }

        log.info("LoginAttemptService initialized: maxAttempts={}, lockoutDuration={}min, attemptWindow={}min",
            maxAttempts, lockoutDuration.toMinutes(), attemptWindow.toMinutes());
    }

    /**
     * Record a failed login attempt.
     *
     * @param email     The email that failed to login
     * @param ipAddress The IP address of the request
     * @return true if the account is now locked
     */
    @Transactional
    public boolean recordFailedAttempt(String email, String ipAddress) {
        LoginAttempt attempt = new LoginAttempt(email, ipAddress, false);
        loginAttemptRepository.save(attempt);

        long failedCount = getFailedAttemptCount(email);
        log.debug("Failed login attempt for {}: {} of {} max", email, failedCount, maxAttempts);

        if (failedCount >= maxAttempts) {
            log.warn("Account locked due to too many failed attempts: {}", email);
            sendLockoutNotification(email, ipAddress);
            return true;
        }

        return false;
    }

    /**
     * Record a successful login and clear failed attempts.
     *
     * @param email     The email that successfully logged in
     * @param ipAddress The IP address of the request
     */
    @Transactional
    public void recordSuccessfulLogin(String email, String ipAddress) {
        // Clear all failed attempts on successful login
        int deleted = loginAttemptRepository.deleteByEmail(email);
        if (deleted > 0) {
            log.debug("Cleared {} failed login attempts for {}", deleted, email);
        }

        // Record the successful attempt (optional, for audit trail)
        LoginAttempt attempt = new LoginAttempt(email, ipAddress, true);
        loginAttemptRepository.save(attempt);
    }

    /**
     * Clear all login attempts for an email (used after password reset).
     *
     * @param email The email to clear attempts for
     */
    @Transactional
    public void clearAttempts(String email) {
        int deleted = loginAttemptRepository.deleteByEmail(email);
        if (deleted > 0) {
            log.info("Cleared {} login attempts for {} after password reset", deleted, email);
        }
    }

    /**
     * Check if an account is currently locked.
     *
     * @param email The email to check
     * @return true if the account is locked
     */
    public boolean isLocked(String email) {
        long failedCount = getFailedAttemptCount(email);
        return failedCount >= maxAttempts;
    }

    /**
     * Get the remaining lockout time for an account.
     *
     * @param email The email to check
     * @return Duration until unlock, or Duration.ZERO if not locked
     */
    public Duration getRemainingLockoutTime(String email) {
        if (!isLocked(email)) {
            return Duration.ZERO;
        }

        LoginAttempt mostRecent = loginAttemptRepository.findMostRecentFailedAttempt(email);
        if (mostRecent == null) {
            return Duration.ZERO;
        }

        Instant unlockTime = mostRecent.getAttemptedAt().plus(lockoutDuration);
        Duration remaining = Duration.between(Instant.now(), unlockTime);

        return remaining.isNegative() ? Duration.ZERO : remaining;
    }

    /**
     * Get the count of failed attempts within the attempt window.
     */
    private long getFailedAttemptCount(String email) {
        Instant windowStart = Instant.now().minus(attemptWindow);
        return loginAttemptRepository.countFailedAttemptsSince(email, windowStart);
    }

    /**
     * Send email notification when an account is locked.
     */
    private void sendLockoutNotification(String email, String ipAddress) {
        try {
            emailService.sendAccountLockedEmail(email, ipAddress, lockoutDuration.toMinutes());
        } catch (Exception e) {
            log.error("Failed to send lockout notification email to {}: {}", email, e.getMessage());
        }
    }

    /**
     * Clean up old login attempts (runs daily).
     */
    @Scheduled(cron = "0 0 3 * * ?") // 3 AM daily
    @Transactional
    public void cleanupOldAttempts() {
        // Keep attempts for 24 hours for audit purposes
        Instant cutoff = Instant.now().minus(Duration.ofHours(24));
        int deleted = loginAttemptRepository.deleteAttemptsOlderThan(cutoff);
        if (deleted > 0) {
            log.info("Cleaned up {} old login attempts", deleted);
        }
    }
}
