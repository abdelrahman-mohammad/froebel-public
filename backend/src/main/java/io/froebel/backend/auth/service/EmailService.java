package io.froebel.backend.auth.service;

import io.froebel.backend.config.AppProperties;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.settings.service.NotificationPreferenceService;
import io.froebel.backend.settings.service.NotificationPreferenceService.NotificationType;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;
    private final NotificationPreferenceService notificationPreferenceService;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public EmailService(
        JavaMailSender mailSender,
        AppProperties appProperties,
        NotificationPreferenceService notificationPreferenceService
    ) {
        this.mailSender = mailSender;
        this.appProperties = appProperties;
        this.notificationPreferenceService = notificationPreferenceService;
    }

    /**
     * Check if a notification should be sent based on user preferences.
     */
    public boolean shouldSendNotification(UUID userId, NotificationType type) {
        return notificationPreferenceService.shouldSendNotification(userId, type);
    }

    private boolean isMailConfigured() {
        return mailUsername != null && !mailUsername.isBlank();
    }

    public void sendVerificationEmail(User user, String token) {
        String verificationUrl = appProperties.getFrontendUrl() + "/verify-email?token=" + token;

        if (!isMailConfigured()) {
            log.debug("[DEV] Email verification link for {}: {}", user.getEmail(), verificationUrl);
            return;
        }

        String subject = "Verify your Froebel account";
        String content = buildVerificationEmailContent(user.getDisplayName(), verificationUrl);

        sendEmail(user.getEmail(), subject, content);
    }

    public void sendPasswordResetEmail(User user, String token) {
        String resetUrl = appProperties.getFrontendUrl() + "/reset-password?token=" + token;

        if (!isMailConfigured()) {
            log.debug("[DEV] Password reset link for {}: {}", user.getEmail(), resetUrl);
            return;
        }

        String subject = "Reset your Froebel password";
        String content = buildPasswordResetEmailContent(user.getDisplayName(), resetUrl);

        sendEmail(user.getEmail(), subject, content);
    }

    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailUsername);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.debug("Email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildVerificationEmailContent(String displayName, String verificationUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Welcome to Froebel!</h2>
                    <p>Hi %s,</p>
                    <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
                    <p><a href="%s" class="button">Verify Email</a></p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p><a href="%s">%s</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <div class="footer">
                        <p>If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(displayName, verificationUrl, verificationUrl, verificationUrl);
    }

    private String buildPasswordResetEmailContent(String displayName, String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Password Reset Request</h2>
                    <p>Hi %s,</p>
                    <p>We received a request to reset your password. Click the button below to choose a new password:</p>
                    <p><a href="%s" class="button">Reset Password</a></p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p><a href="%s">%s</a></p>
                    <p>This link will expire in 1 hour.</p>
                    <div class="footer">
                        <p>If you didn't request a password reset, you can safely ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(displayName, resetUrl, resetUrl, resetUrl);
    }

    public void sendAccountExistsNotification(String email) {
        String loginUrl = appProperties.getFrontendUrl() + "/login";
        String resetUrl = appProperties.getFrontendUrl() + "/forgot-password";

        if (!isMailConfigured()) {
            log.debug("[DEV] Account exists notification for: {}", email);
            return;
        }

        String subject = "Froebel Account - Registration Attempt";
        String content = buildAccountExistsEmailContent(loginUrl, resetUrl);

        sendEmail(email, subject, content);
    }

    private String buildAccountExistsEmailContent(String loginUrl, String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-right: 10px; }
                    .button-secondary { background-color: #6B7280; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Account Already Exists</h2>
                    <p>Someone attempted to create a new account using your email address.</p>
                    <p>If this was you and you forgot your password, you can reset it:</p>
                    <p>
                        <a href="%s" class="button">Log In</a>
                        <a href="%s" class="button button-secondary">Reset Password</a>
                    </p>
                    <div class="footer">
                        <p>If you didn't attempt to register, you can safely ignore this email. Your account is secure.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(loginUrl, resetUrl);
    }

    public void sendAccountLockedEmail(String email, String ipAddress, long lockoutMinutes) {
        String resetUrl = appProperties.getFrontendUrl() + "/forgot-password";

        if (!isMailConfigured()) {
            log.debug("[DEV] Account locked notification for {} (IP: {}, lockout: {} minutes)",
                email, ipAddress, lockoutMinutes);
            return;
        }

        String subject = "Froebel Account - Security Alert";
        String content = buildAccountLockedEmailContent(ipAddress, lockoutMinutes, resetUrl);

        sendEmail(email, subject, content);
    }

    private String buildAccountLockedEmailContent(String ipAddress, long lockoutMinutes, String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .alert { background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 6px; padding: 16px; margin-bottom: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                    .details { background-color: #F3F4F6; padding: 12px; border-radius: 4px; font-family: monospace; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>🔒 Account Temporarily Locked</h2>
                    <div class="alert">
                        <p><strong>Security Alert:</strong> Your account has been temporarily locked due to multiple failed login attempts.</p>
                    </div>
                    <p>We detected several unsuccessful login attempts on your account:</p>
                    <div class="details">
                        <p>IP Address: %s</p>
                        <p>Lockout Duration: %d minutes</p>
                    </div>
                    <p>If this was you, please wait for the lockout period to expire and try again with the correct password.</p>
                    <p>If you've forgotten your password, you can reset it:</p>
                    <p><a href="%s" class="button">Reset Password</a></p>
                    <div class="footer">
                        <p><strong>Wasn't you?</strong> If you didn't attempt to log in, someone may be trying to access your account. We recommend changing your password immediately after the lockout expires.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(ipAddress, lockoutMinutes, resetUrl);
    }

    /**
     * Send a password change notification to the user.
     * Respects user notification preferences.
     */
    public void sendPasswordChangedNotification(User user, String ipAddress) {
        // Check user preferences
        if (!shouldSendNotification(user.getId(), NotificationType.SECURITY_PASSWORD_CHANGE)) {
            log.debug("Password change notification skipped for {} (disabled in preferences)", user.getEmail());
            return;
        }

        if (!isMailConfigured()) {
            log.debug("[DEV] Password changed notification for {} (IP: {})", user.getEmail(), ipAddress);
            return;
        }

        String subject = "Froebel Account - Password Changed";
        String content = buildPasswordChangedEmailContent(user.getDisplayName(), ipAddress);

        sendEmail(user.getEmail(), subject, content);
    }

    private String buildPasswordChangedEmailContent(String displayName, String ipAddress) {
        String settingsUrl = appProperties.getFrontendUrl() + "/settings/security";
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .alert { background-color: #ECFDF5; border: 1px solid #6EE7B7; border-radius: 6px; padding: 16px; margin-bottom: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                    .details { background-color: #F3F4F6; padding: 12px; border-radius: 4px; font-family: monospace; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Password Changed Successfully</h2>
                    <div class="alert">
                        <p>Hi %s, your password was just changed.</p>
                    </div>
                    <div class="details">
                        <p>IP Address: %s</p>
                        <p>Time: Just now</p>
                    </div>
                    <p>If you made this change, no further action is needed.</p>
                    <p>If you didn't change your password, please secure your account immediately:</p>
                    <p><a href="%s" class="button">Review Security Settings</a></p>
                    <div class="footer">
                        <p>You received this email because security notifications are enabled for your account.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(displayName, ipAddress, settingsUrl);
    }

    /**
     * Send a new login notification to the user.
     * Respects user notification preferences.
     */
    public void sendNewLoginNotification(User user, String ipAddress, String deviceInfo) {
        // Check user preferences
        if (!shouldSendNotification(user.getId(), NotificationType.SECURITY_NEW_LOGIN)) {
            log.debug("New login notification skipped for {} (disabled in preferences)", user.getEmail());
            return;
        }

        if (!isMailConfigured()) {
            log.debug("[DEV] New login notification for {} (IP: {}, Device: {})", user.getEmail(), ipAddress, deviceInfo);
            return;
        }

        String subject = "Froebel Account - New Login Detected";
        String content = buildNewLoginEmailContent(user.getDisplayName(), ipAddress, deviceInfo);

        sendEmail(user.getEmail(), subject, content);
    }

    private String buildNewLoginEmailContent(String displayName, String ipAddress, String deviceInfo) {
        String settingsUrl = appProperties.getFrontendUrl() + "/settings/security";
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .alert { background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 6px; padding: 16px; margin-bottom: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                    .details { background-color: #F3F4F6; padding: 12px; border-radius: 4px; font-family: monospace; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>New Login to Your Account</h2>
                    <div class="alert">
                        <p>Hi %s, we noticed a new login to your account.</p>
                    </div>
                    <div class="details">
                        <p>Device: %s</p>
                        <p>IP Address: %s</p>
                        <p>Time: Just now</p>
                    </div>
                    <p>If this was you, no action is needed.</p>
                    <p>If you don't recognize this login, please review your active sessions:</p>
                    <p><a href="%s" class="button">Review Active Sessions</a></p>
                    <div class="footer">
                        <p>You received this email because login notifications are enabled for your account.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(displayName, deviceInfo, ipAddress, settingsUrl);
    }
}
