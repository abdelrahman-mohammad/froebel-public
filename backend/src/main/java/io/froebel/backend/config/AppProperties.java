package io.froebel.backend.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private static final Logger log = LoggerFactory.getLogger(AppProperties.class);

    @PostConstruct
    public void validateConfig() {
        if (security.getLockoutDurationMinutes() < security.getAttemptWindowMinutes()) {
            throw new IllegalStateException(
                "Security config error: lockoutDurationMinutes (" + security.getLockoutDurationMinutes() +
                    ") must be >= attemptWindowMinutes (" + security.getAttemptWindowMinutes() +
                    "). Otherwise, old failed attempts outside the lockout duration could still count toward the lockout threshold."
            );
        }
        log.info("Security config validated: maxLoginAttempts={}, lockoutDurationMinutes={}, attemptWindowMinutes={}",
            security.getMaxLoginAttempts(), security.getLockoutDurationMinutes(), security.getAttemptWindowMinutes());
    }

    private String frontendUrl = "http://localhost:3000";
    private long emailVerificationExpiry = 86400000; // 24 hours
    private long passwordResetExpiry = 3600000; // 1 hour
    private OAuth2Config oauth2 = new OAuth2Config();
    private RateLimitingConfig rateLimiting = new RateLimitingConfig();
    private SecurityConfig security = new SecurityConfig();
    private SettingsConfig settings = new SettingsConfig();

    public String getFrontendUrl() {
        return frontendUrl;
    }

    public void setFrontendUrl(String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    public long getEmailVerificationExpiry() {
        return emailVerificationExpiry;
    }

    public void setEmailVerificationExpiry(long emailVerificationExpiry) {
        this.emailVerificationExpiry = emailVerificationExpiry;
    }

    public long getPasswordResetExpiry() {
        return passwordResetExpiry;
    }

    public void setPasswordResetExpiry(long passwordResetExpiry) {
        this.passwordResetExpiry = passwordResetExpiry;
    }

    public OAuth2Config getOauth2() {
        return oauth2;
    }

    public void setOauth2(OAuth2Config oauth2) {
        this.oauth2 = oauth2;
    }

    public RateLimitingConfig getRateLimiting() {
        return rateLimiting;
    }

    public void setRateLimiting(RateLimitingConfig rateLimiting) {
        this.rateLimiting = rateLimiting;
    }

    public SecurityConfig getSecurity() {
        return security;
    }

    public void setSecurity(SecurityConfig security) {
        this.security = security;
    }

    public SettingsConfig getSettings() {
        return settings;
    }

    public void setSettings(SettingsConfig settings) {
        this.settings = settings;
    }

    public static class SettingsConfig {
        private AccountDeletionConfig accountDeletion = new AccountDeletionConfig();
        private DataExportConfig dataExport = new DataExportConfig();

        public AccountDeletionConfig getAccountDeletion() {
            return accountDeletion;
        }

        public void setAccountDeletion(AccountDeletionConfig accountDeletion) {
            this.accountDeletion = accountDeletion;
        }

        public DataExportConfig getDataExport() {
            return dataExport;
        }

        public void setDataExport(DataExportConfig dataExport) {
            this.dataExport = dataExport;
        }
    }

    public static class AccountDeletionConfig {
        private int gracePeriodDays = 30;

        public int getGracePeriodDays() {
            return gracePeriodDays;
        }

        public void setGracePeriodDays(int gracePeriodDays) {
            this.gracePeriodDays = gracePeriodDays;
        }
    }

    public static class DataExportConfig {
        private String storagePath = System.getProperty("java.io.tmpdir") + "/froebel-exports";
        private int expiryDays = 7;
        private int maxPerDay = 1;

        public String getStoragePath() {
            return storagePath;
        }

        public void setStoragePath(String storagePath) {
            this.storagePath = storagePath;
        }

        public int getExpiryDays() {
            return expiryDays;
        }

        public void setExpiryDays(int expiryDays) {
            this.expiryDays = expiryDays;
        }

        public int getMaxPerDay() {
            return maxPerDay;
        }

        public void setMaxPerDay(int maxPerDay) {
            this.maxPerDay = maxPerDay;
        }
    }

    public static class SecurityConfig {
        private int maxLoginAttempts = 5;
        private int lockoutDurationMinutes = 15;
        private int attemptWindowMinutes = 15;

        public int getMaxLoginAttempts() {
            return maxLoginAttempts;
        }

        public void setMaxLoginAttempts(int maxLoginAttempts) {
            this.maxLoginAttempts = maxLoginAttempts;
        }

        public int getLockoutDurationMinutes() {
            return lockoutDurationMinutes;
        }

        public void setLockoutDurationMinutes(int lockoutDurationMinutes) {
            this.lockoutDurationMinutes = lockoutDurationMinutes;
        }

        public int getAttemptWindowMinutes() {
            return attemptWindowMinutes;
        }

        public void setAttemptWindowMinutes(int attemptWindowMinutes) {
            this.attemptWindowMinutes = attemptWindowMinutes;
        }
    }

    public static class RateLimitingConfig {
        private int authRequestsPerMinute = 10;
        private int passwordResetPerHour = 3;
        private int verificationResendPerHour = 5;
        private String trustedProxies = "127.0.0.1,::1";

        public int getAuthRequestsPerMinute() {
            return authRequestsPerMinute;
        }

        public void setAuthRequestsPerMinute(int authRequestsPerMinute) {
            this.authRequestsPerMinute = authRequestsPerMinute;
        }

        public int getPasswordResetPerHour() {
            return passwordResetPerHour;
        }

        public void setPasswordResetPerHour(int passwordResetPerHour) {
            this.passwordResetPerHour = passwordResetPerHour;
        }

        public int getVerificationResendPerHour() {
            return verificationResendPerHour;
        }

        public void setVerificationResendPerHour(int verificationResendPerHour) {
            this.verificationResendPerHour = verificationResendPerHour;
        }

        public String getTrustedProxies() {
            return trustedProxies;
        }

        public void setTrustedProxies(String trustedProxies) {
            this.trustedProxies = trustedProxies;
        }
    }

    public static class OAuth2Config {
        private String callbackBaseUrl = "http://localhost:8080";
        private String frontendCallbackPath = "/auth/callback";
        private int stateExpiryMinutes = 5;

        public String getCallbackBaseUrl() {
            return callbackBaseUrl;
        }

        public void setCallbackBaseUrl(String callbackBaseUrl) {
            this.callbackBaseUrl = callbackBaseUrl;
        }

        public String getFrontendCallbackPath() {
            return frontendCallbackPath;
        }

        public void setFrontendCallbackPath(String frontendCallbackPath) {
            this.frontendCallbackPath = frontendCallbackPath;
        }

        public int getStateExpiryMinutes() {
            return stateExpiryMinutes;
        }

        public void setStateExpiryMinutes(int stateExpiryMinutes) {
            this.stateExpiryMinutes = stateExpiryMinutes;
        }
    }
}
