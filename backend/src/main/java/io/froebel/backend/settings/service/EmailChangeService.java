package io.froebel.backend.settings.service;

import io.froebel.backend.auth.exception.InvalidCredentialsException;
import io.froebel.backend.auth.exception.InvalidTokenException;
import io.froebel.backend.auth.exception.TokenExpiredException;
import io.froebel.backend.auth.service.AuditLogService;
import io.froebel.backend.auth.service.EmailService;
import io.froebel.backend.auth.service.RefreshTokenService;
import io.froebel.backend.config.AppProperties;
import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.EmailChangeRequest;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.repository.EmailChangeRequestRepository;
import io.froebel.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class EmailChangeService {

    private static final Logger log = LoggerFactory.getLogger(EmailChangeService.class);
    private static final int TOKEN_VALIDITY_HOURS = 24;

    private final UserRepository userRepository;
    private final EmailChangeRequestRepository emailChangeRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RefreshTokenService refreshTokenService;
    private final SessionManagementService sessionManagementService;
    private final AuditLogService auditLogService;
    private final AppProperties appProperties;

    public EmailChangeService(
        UserRepository userRepository,
        EmailChangeRequestRepository emailChangeRequestRepository,
        PasswordEncoder passwordEncoder,
        EmailService emailService,
        RefreshTokenService refreshTokenService,
        SessionManagementService sessionManagementService,
        AuditLogService auditLogService,
        AppProperties appProperties
    ) {
        this.userRepository = userRepository;
        this.emailChangeRequestRepository = emailChangeRequestRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.refreshTokenService = refreshTokenService;
        this.sessionManagementService = sessionManagementService;
        this.auditLogService = auditLogService;
        this.appProperties = appProperties;
    }

    @Transactional
    public void requestEmailChange(UUID userId, String newEmail, String password, String ipAddress) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Verify password (required even for OAuth users who have set a password)
        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid password");
        }

        // Check if new email is the same as current
        if (user.getEmail().equalsIgnoreCase(newEmail)) {
            throw new IllegalArgumentException("New email must be different from current email");
        }

        // Check if new email is already in use
        if (userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("This email is already associated with another account");
        }

        // Check if there's already a pending change to this email
        if (emailChangeRequestRepository.existsByNewEmailAndConfirmedAtIsNull(newEmail)) {
            throw new IllegalArgumentException("There is already a pending email change request for this email");
        }

        // Cancel any existing pending requests for this user
        emailChangeRequestRepository.findByUserIdAndConfirmedAtIsNull(userId)
            .ifPresent(emailChangeRequestRepository::delete);

        // Create new email change request
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(TOKEN_VALIDITY_HOURS, ChronoUnit.HOURS);

        EmailChangeRequest request = EmailChangeRequest.builder()
            .user(user)
            .newEmail(newEmail)
            .token(token)
            .expiresAt(expiresAt)
            .build();

        emailChangeRequestRepository.save(request);

        // Send confirmation email to NEW email address
        sendConfirmationEmail(newEmail, user.getDisplayName(), token);

        // Send notification to OLD email address
        sendNotificationToOldEmail(user.getEmail(), user.getDisplayName(), newEmail);

        log.info("Email change requested for user {} from {} to {}", userId, user.getEmail(), newEmail);
        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.PASSWORD_RESET_REQUEST,
            userId,
            user.getEmail(),
            ipAddress,
            "action=email_change_request, new_email=" + newEmail
        );
    }

    @Transactional
    public void confirmEmailChange(String token, String ipAddress) {
        EmailChangeRequest request = emailChangeRequestRepository.findByToken(token)
            .orElseThrow(() -> new InvalidTokenException("Invalid email change token"));

        if (request.isConfirmed()) {
            throw new InvalidTokenException("This email change has already been confirmed");
        }

        if (request.isExpired()) {
            throw new TokenExpiredException("Email change token has expired");
        }

        // Double-check the new email is still available
        if (userRepository.existsByEmail(request.getNewEmail())) {
            throw new IllegalArgumentException("This email is already associated with another account");
        }

        User user = request.getUser();
        String oldEmail = user.getEmail();
        String newEmail = request.getNewEmail();

        // Update user's email
        user.setEmail(newEmail);
        userRepository.save(user);

        // Mark request as confirmed
        request.setConfirmedAt(Instant.now());
        emailChangeRequestRepository.save(request);

        // Revoke all sessions (force re-login)
        refreshTokenService.revokeAllUserTokens(user.getId());
        sessionManagementService.revokeAllSessions(user.getId());

        // Send confirmation to new email
        sendChangeCompleteEmail(newEmail, user.getDisplayName());

        // Send notification to old email
        sendChangeCompleteNotificationToOldEmail(oldEmail, user.getDisplayName(), newEmail);

        log.info("Email changed for user {} from {} to {}", user.getId(), oldEmail, newEmail);
        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.PASSWORD_CHANGE,
            user.getId(),
            newEmail,
            ipAddress,
            "action=email_change_complete, old_email=" + oldEmail
        );
    }

    @Transactional
    public void setPassword(UUID userId, String newPassword, String ipAddress) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Only allow setting password if user doesn't have one (OAuth-only user)
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            throw new IllegalStateException("Password is already set. Use change password instead.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password set for OAuth user {}", userId);
        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.PASSWORD_CHANGE,
            userId,
            user.getEmail(),
            ipAddress,
            "action=password_set"
        );
    }

    private void sendConfirmationEmail(String newEmail, String displayName, String token) {
        String confirmUrl = appProperties.getFrontendUrl() + "/settings/confirm-email?token=" + token;
        log.debug("[DEV] Email change confirmation link for {}: {}", newEmail, confirmUrl);
        // TODO: Implement actual email sending via EmailService when templates are ready
    }

    private void sendNotificationToOldEmail(String oldEmail, String displayName, String newEmail) {
        log.debug("[DEV] Email change notification sent to old email {}: request to change to {}", oldEmail, newEmail);
        // TODO: Implement actual email sending via EmailService when templates are ready
    }

    private void sendChangeCompleteEmail(String newEmail, String displayName) {
        log.debug("[DEV] Email change complete notification sent to new email {}", newEmail);
        // TODO: Implement actual email sending via EmailService when templates are ready
    }

    private void sendChangeCompleteNotificationToOldEmail(String oldEmail, String displayName, String newEmail) {
        log.debug("[DEV] Email change complete notification sent to old email {}: changed to {}", oldEmail, newEmail);
        // TODO: Implement actual email sending via EmailService when templates are ready
    }
}
