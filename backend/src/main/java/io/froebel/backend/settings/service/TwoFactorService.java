package io.froebel.backend.settings.service;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.TwoFactorBackupCode;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.repository.TwoFactorBackupCodeRepository;
import io.froebel.backend.repository.UserRepository;
import io.froebel.backend.settings.dto.BackupCodesResponse;
import io.froebel.backend.settings.dto.TwoFactorSetupResponse;
import io.froebel.backend.settings.dto.TwoFactorStatusResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TwoFactorService {

    private static final Logger log = LoggerFactory.getLogger(TwoFactorService.class);
    private static final String ISSUER = "Froebel";
    private static final int BACKUP_CODE_COUNT = 8;
    private static final int BACKUP_CODE_LENGTH = 8;

    private final UserRepository userRepository;
    private final TwoFactorBackupCodeRepository backupCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecretGenerator secretGenerator;
    private final CodeVerifier codeVerifier;

    public TwoFactorService(
        UserRepository userRepository,
        TwoFactorBackupCodeRepository backupCodeRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.backupCodeRepository = backupCodeRepository;
        this.passwordEncoder = passwordEncoder;

        // Initialize TOTP components
        this.secretGenerator = new DefaultSecretGenerator();
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1);
        this.codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
    }

    public TwoFactorStatusResponse getStatus(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        int backupCodesRemaining = (int) backupCodeRepository.countByUserIdAndUsedAtIsNull(userId);

        return new TwoFactorStatusResponse(
            user.isTwoFactorEnabled(),
            user.getTwoFactorConfirmedAt(),
            backupCodesRemaining
        );
    }

    @Transactional
    public TwoFactorSetupResponse setup(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.isTwoFactorEnabled()) {
            throw new IllegalStateException("Two-factor authentication is already enabled");
        }

        // Generate a new secret
        String secret = secretGenerator.generate();

        // Store the secret (not confirmed yet)
        user.setTwoFactorSecret(secret);
        userRepository.save(user);

        // Generate QR code URI
        String qrCodeUri = buildQrCodeUri(user.getEmail(), secret);

        log.debug("2FA setup initiated for user {}", userId);

        return new TwoFactorSetupResponse(secret, qrCodeUri);
    }

    @Transactional
    public BackupCodesResponse confirm(UUID userId, String code) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.isTwoFactorEnabled()) {
            throw new IllegalStateException("Two-factor authentication is already enabled");
        }

        if (user.getTwoFactorSecret() == null) {
            throw new IllegalStateException("Please initiate 2FA setup first");
        }

        // Verify the code
        if (!verifyCode(user.getTwoFactorSecret(), code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        // Enable 2FA
        user.setTwoFactorEnabled(true);
        user.setTwoFactorConfirmedAt(Instant.now());
        userRepository.save(user);

        // Generate backup codes
        List<String> backupCodes = generateBackupCodes(userId);

        log.info("2FA enabled for user {}", userId);

        return BackupCodesResponse.of(backupCodes);
    }

    @Transactional
    public void disable(UUID userId, String code) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.isTwoFactorEnabled()) {
            throw new IllegalStateException("Two-factor authentication is not enabled");
        }

        // Verify the code (or backup code)
        if (!verifyCodeOrBackup(userId, user.getTwoFactorSecret(), code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        // Disable 2FA
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setTwoFactorConfirmedAt(null);
        userRepository.save(user);

        // Delete all backup codes
        backupCodeRepository.deleteByUserId(userId);

        log.info("2FA disabled for user {}", userId);
    }

    @Transactional
    public BackupCodesResponse regenerateBackupCodes(UUID userId, String code) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.isTwoFactorEnabled()) {
            throw new IllegalStateException("Two-factor authentication is not enabled");
        }

        // Verify the code
        if (!verifyCode(user.getTwoFactorSecret(), code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        // Delete old backup codes
        backupCodeRepository.deleteByUserId(userId);

        // Generate new backup codes
        List<String> backupCodes = generateBackupCodes(userId);

        log.info("Backup codes regenerated for user {}", userId);

        return BackupCodesResponse.of(backupCodes);
    }

    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null) {
            return false;
        }
        return codeVerifier.isValidCode(secret, code);
    }

    public boolean verifyCodeOrBackup(UUID userId, String secret, String code) {
        // First try TOTP code
        if (verifyCode(secret, code)) {
            return true;
        }

        // Then try backup codes
        return verifyAndConsumeBackupCode(userId, code);
    }

    @Transactional
    public boolean verifyAndConsumeBackupCode(UUID userId, String code) {
        List<TwoFactorBackupCode> backupCodes = backupCodeRepository.findByUserIdAndUsedAtIsNull(userId);

        for (TwoFactorBackupCode backupCode : backupCodes) {
            if (passwordEncoder.matches(code, backupCode.getCodeHash())) {
                backupCode.setUsedAt(Instant.now());
                backupCodeRepository.save(backupCode);
                log.info("Backup code used for user {}", userId);
                return true;
            }
        }

        return false;
    }

    private List<String> generateBackupCodes(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<String> codes = new ArrayList<>();
        SecureRandom random = new SecureRandom();

        for (int i = 0; i < BACKUP_CODE_COUNT; i++) {
            // Generate a random alphanumeric code
            String code = generateRandomCode(random, BACKUP_CODE_LENGTH);
            codes.add(code);

            // Save hashed code to database
            TwoFactorBackupCode backupCode = TwoFactorBackupCode.builder()
                .user(user)
                .codeHash(passwordEncoder.encode(code))
                .build();
            backupCodeRepository.save(backupCode);
        }

        return codes;
    }

    private String generateRandomCode(SecureRandom random, int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String buildQrCodeUri(String email, String secret) {
        QrData qrData = new QrData.Builder()
            .label(email)
            .secret(secret)
            .issuer(ISSUER)
            .algorithm(HashingAlgorithm.SHA1)
            .digits(6)
            .period(30)
            .build();

        return qrData.getUri();
    }
}
