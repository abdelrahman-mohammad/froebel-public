package io.froebel.backend.auth.service;

import io.froebel.backend.auth.dto.request.LoginRequest;
import io.froebel.backend.auth.dto.request.RefreshTokenRequest;
import io.froebel.backend.auth.dto.request.RegisterRequest;
import io.froebel.backend.auth.dto.response.AuthResponse;
import io.froebel.backend.auth.dto.response.TokenResponse;
import io.froebel.backend.auth.dto.response.UserResponse;
import io.froebel.backend.auth.exception.AccountLockedException;
import io.froebel.backend.auth.exception.EmailNotVerifiedException;
import io.froebel.backend.auth.exception.InvalidCredentialsException;
import io.froebel.backend.auth.exception.InvalidTokenException;
import io.froebel.backend.auth.exception.InvalidTwoFactorCodeException;
import io.froebel.backend.auth.exception.TokenExpiredException;
import io.froebel.backend.auth.exception.TwoFactorRequiredException;
import io.froebel.backend.config.AppProperties;
import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.PasswordResetToken;
import io.froebel.backend.model.entity.RefreshToken;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.enums.Role;
import io.froebel.backend.model.entity.UserSession;
import io.froebel.backend.repository.PasswordResetTokenRepository;
import io.froebel.backend.repository.UserRepository;
import io.froebel.backend.settings.service.NotificationPreferenceService;
import io.froebel.backend.settings.service.SessionManagementService;
import io.froebel.backend.settings.service.TwoFactorService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    // Pre-computed BCrypt hash for timing attack prevention
    // This is a valid BCrypt hash of "dummy-password-for-timing" used to ensure
    // constant-time comparison even when user doesn't exist
    private static final String DUMMY_BCRYPT_HASH =
        "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsS7JpYX3.xCKn6s8.";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final AppProperties appProperties;
    private final LoginAttemptService loginAttemptService;
    private final AuditLogService auditLogService;
    private final NotificationPreferenceService notificationPreferenceService;
    private final SessionManagementService sessionManagementService;
    private final TwoFactorService twoFactorService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        RefreshTokenService refreshTokenService,
        EmailService emailService,
        PasswordResetTokenRepository passwordResetTokenRepository,
        AppProperties appProperties,
        LoginAttemptService loginAttemptService,
        AuditLogService auditLogService,
        NotificationPreferenceService notificationPreferenceService,
        SessionManagementService sessionManagementService,
        TwoFactorService twoFactorService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.appProperties = appProperties;
        this.loginAttemptService = loginAttemptService;
        this.auditLogService = auditLogService;
        this.notificationPreferenceService = notificationPreferenceService;
        this.sessionManagementService = sessionManagementService;
        this.twoFactorService = twoFactorService;
    }

    @Transactional
    public void register(RegisterRequest request, String ipAddress) {
        // Check if email exists - send notification instead of error to prevent enumeration
        if (userRepository.existsByEmail(request.email())) {
            emailService.sendAccountExistsNotification(request.email());
            return;
        }

        // Generate email verification token
        String verificationToken = UUID.randomUUID().toString();
        Instant tokenExpiry = Instant.now().plusMillis(appProperties.getEmailVerificationExpiry());

        // Create user
        User user = User.builder()
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .displayName(request.displayName())
            .role(Role.USER)
            .provider("local")
            .emailVerified(false)
            .emailVerificationToken(verificationToken)
            .emailVerificationTokenExpiry(tokenExpiry)
            .build();

        user = userRepository.save(user);

        // Create default notification preferences
        notificationPreferenceService.createDefaultPreferences(user.getId());

        // Audit log
        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.REGISTER,
            user.getId(),
            user.getEmail(),
            ipAddress,
            "provider=local"
        );

        // Send verification email (logs to console in dev mode)
        emailService.sendVerificationEmail(user, verificationToken);
    }

    public AuthResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String email = request.email();

        // Check if account is locked due to too many failed attempts
        if (loginAttemptService.isLocked(email)) {
            Duration remaining = loginAttemptService.getRemainingLockoutTime(email);
            auditLogService.logAuthEvent(
                AuditLogService.AuthEventType.LOGIN_LOCKED,
                email,
                ipAddress,
                "lockout_remaining_minutes=" + remaining.toMinutes()
            );
            throw new AccountLockedException(
                "Account is temporarily locked due to too many failed login attempts. Please try again in " +
                    remaining.toMinutes() + " minutes.",
                remaining
            );
        }

        User user = userRepository.findByEmail(email).orElse(null);

        // Check credentials - use constant-time comparison even for non-existent users
        boolean credentialsValid = false;
        if (user != null && user.getPassword() != null) {
            credentialsValid = passwordEncoder.matches(request.password(), user.getPassword());
        } else {
            // Perform dummy comparison to prevent timing attacks
            // Using matches() with pre-computed hash ensures same timing profile as real comparison
            passwordEncoder.matches(request.password(), DUMMY_BCRYPT_HASH);
        }

        if (!credentialsValid || user == null) {
            // Record failed attempt
            loginAttemptService.recordFailedAttempt(email, ipAddress);
            auditLogService.logAuthEvent(
                AuditLogService.AuthEventType.LOGIN_FAILED,
                email,
                ipAddress,
                "reason=invalid_credentials"
            );
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            auditLogService.logAuthEvent(
                AuditLogService.AuthEventType.LOGIN_FAILED,
                user.getId(),
                email,
                ipAddress,
                "reason=email_not_verified"
            );
            throw new EmailNotVerifiedException("Please verify your email before logging in");
        }

        // Check two-factor authentication
        if (user.isTwoFactorEnabled()) {
            String twoFactorCode = request.twoFactorCode();
            if (twoFactorCode == null || twoFactorCode.isBlank()) {
                // User has 2FA enabled but didn't provide a code
                auditLogService.logAuthEvent(
                    AuditLogService.AuthEventType.LOGIN_FAILED,
                    user.getId(),
                    email,
                    ipAddress,
                    "reason=2fa_required"
                );
                throw new TwoFactorRequiredException();
            }

            // Verify the 2FA code (TOTP or backup code)
            if (!twoFactorService.verifyCodeOrBackup(user.getId(), user.getTwoFactorSecret(), twoFactorCode)) {
                loginAttemptService.recordFailedAttempt(email, ipAddress);
                auditLogService.logAuthEvent(
                    AuditLogService.AuthEventType.LOGIN_FAILED,
                    user.getId(),
                    email,
                    ipAddress,
                    "reason=invalid_2fa_code"
                );
                throw new InvalidTwoFactorCodeException();
            }
        }

        // Record successful login (clears failed attempts)
        loginAttemptService.recordSuccessfulLogin(email, ipAddress);

        // Create refresh token and session
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        UserSession session = sessionManagementService.createSession(user, refreshToken, ipAddress, userAgent);

        // Generate access token with session ID
        String accessToken = jwtService.generateAccessToken(
            user.getId(), user.getEmail(), user.getRole().name(), session.getId()
        );

        // Audit successful login
        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.LOGIN_SUCCESS,
            user.getId(),
            email,
            ipAddress,
            null
        );

        return new AuthResponse(
            accessToken,
            refreshToken.getToken(),
            jwtService.getAccessTokenExpiration(),
            UserResponse.from(user)
        );
    }

    public TokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.refreshToken());
        User user = refreshToken.getUser();

        // Find the session ID associated with this refresh token
        UUID sessionId = sessionManagementService.findSessionIdByRefreshToken(refreshToken.getId());

        // Generate new access token with session ID
        String accessToken = jwtService.generateAccessToken(
            user.getId(), user.getEmail(), user.getRole().name(), sessionId
        );

        // Rotate refresh token
        RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(refreshToken);

        // Update session's last active time
        if (sessionId != null) {
            sessionManagementService.updateLastActive(sessionId);
        }

        return new TokenResponse(
            accessToken,
            newRefreshToken.getToken(),
            jwtService.getAccessTokenExpiration()
        );
    }

    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return UserResponse.from(user);
    }

    @Transactional
    public void logout(UUID userId, String email, String ipAddress) {
        refreshTokenService.revokeAllUserTokens(userId);
        sessionManagementService.revokeAllSessions(userId);
        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.LOGOUT,
            userId,
            email,
            ipAddress,
            null
        );
    }

    @Transactional
    public void verifyEmail(String token, String ipAddress) {
        User user = userRepository.findByEmailVerificationToken(token)
            .orElseThrow(() -> new InvalidTokenException("Invalid verification token"));

        if (user.getEmailVerificationTokenExpiry() == null ||
            user.getEmailVerificationTokenExpiry().isBefore(Instant.now())) {
            throw new TokenExpiredException("Verification token has expired");
        }

        if (user.isEmailVerified()) {
            throw new InvalidTokenException("Email is already verified");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepository.save(user);

        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.EMAIL_VERIFICATION,
            user.getId(),
            user.getEmail(),
            ipAddress,
            null
        );
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email).orElse(null);

        // Return silently to prevent email enumeration
        if (user == null || user.isEmailVerified()) {
            return;
        }

        // Generate new token
        String verificationToken = UUID.randomUUID().toString();
        Instant tokenExpiry = Instant.now().plusMillis(appProperties.getEmailVerificationExpiry());

        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationTokenExpiry(tokenExpiry);
        userRepository.save(user);

        emailService.sendVerificationEmail(user, verificationToken);
    }

    @Transactional
    public void forgotPassword(String email, String ipAddress) {
        User user = userRepository.findByEmail(email).orElse(null);

        // Always return success to prevent email enumeration
        if (user == null) {
            return;
        }

        // Invalidate existing tokens
        passwordResetTokenRepository.invalidateAllByUser(user);

        // Create new token
        String token = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plusMillis(appProperties.getPasswordResetExpiry());

        PasswordResetToken resetToken = PasswordResetToken.builder()
            .token(token)
            .user(user)
            .expiryDate(expiryDate)
            .used(false)
            .build();

        passwordResetTokenRepository.save(resetToken);

        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.PASSWORD_RESET_REQUEST,
            user.getId(),
            user.getEmail(),
            ipAddress,
            null
        );

        emailService.sendPasswordResetEmail(user, token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword, String ipAddress) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(token)
            .orElseThrow(() -> new InvalidTokenException("Invalid or already used reset token"));

        if (resetToken.isExpired()) {
            throw new TokenExpiredException("Password reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Revoke all refresh tokens for security
        refreshTokenService.revokeAllUserTokens(user.getId());

        // Clear any failed login attempts so user can immediately log in
        loginAttemptService.clearAttempts(user.getEmail());

        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.PASSWORD_RESET_COMPLETE,
            user.getId(),
            user.getEmail(),
            ipAddress,
            null
        );
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword, String ipAddress) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Revoke all refresh tokens (force re-login on other devices)
        refreshTokenService.revokeAllUserTokens(userId);

        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.PASSWORD_CHANGE,
            userId,
            user.getEmail(),
            ipAddress,
            null
        );
    }
}
