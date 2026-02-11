package io.froebel.backend.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for structured audit logging of authentication events.
 * Logs are structured for easy parsing by log aggregation systems.
 */
@Service
public class AuditLogService {

    private static final Logger auditLog = LoggerFactory.getLogger("AUDIT");

    public enum AuthEventType {
        LOGIN_SUCCESS,
        LOGIN_FAILED,
        LOGIN_LOCKED,
        LOGOUT,
        REGISTER,
        PASSWORD_RESET_REQUEST,
        PASSWORD_RESET_COMPLETE,
        PASSWORD_CHANGE,
        EMAIL_VERIFICATION,
        OAUTH_LOGIN_SUCCESS,
        OAUTH_LOGIN_FAILED,
        OAUTH_ACCOUNT_LINKING_REJECTED,
        TOKEN_REFRESH,
        TOKEN_BLACKLISTED
    }

    /**
     * Log an authentication event with structured data.
     */
    public void logAuthEvent(AuthEventType eventType, String email, String ipAddress, String details) {
        try {
            MDC.put("event_type", eventType.name());
            MDC.put("email", maskEmail(email));
            MDC.put("ip_address", ipAddress);
            MDC.put("audit", "true");

            String message = String.format("[AUTH] %s | email=%s | ip=%s | %s",
                eventType.name(),
                maskEmail(email),
                ipAddress,
                details != null ? details : ""
            );

            switch (eventType) {
                case LOGIN_FAILED, LOGIN_LOCKED, OAUTH_LOGIN_FAILED, OAUTH_ACCOUNT_LINKING_REJECTED ->
                    auditLog.warn(message);
                default -> auditLog.info(message);
            }
        } finally {
            MDC.remove("event_type");
            MDC.remove("email");
            MDC.remove("ip_address");
            MDC.remove("audit");
        }
    }

    /**
     * Log an authentication event for a known user.
     */
    public void logAuthEvent(AuthEventType eventType, UUID userId, String email, String ipAddress, String details) {
        try {
            MDC.put("event_type", eventType.name());
            MDC.put("user_id", userId.toString());
            MDC.put("email", maskEmail(email));
            MDC.put("ip_address", ipAddress);
            MDC.put("audit", "true");

            String message = String.format("[AUTH] %s | user=%s | email=%s | ip=%s | %s",
                eventType.name(),
                userId,
                maskEmail(email),
                ipAddress,
                details != null ? details : ""
            );

            switch (eventType) {
                case LOGIN_FAILED, LOGIN_LOCKED, OAUTH_LOGIN_FAILED, OAUTH_ACCOUNT_LINKING_REJECTED ->
                    auditLog.warn(message);
                default -> auditLog.info(message);
            }
        } finally {
            MDC.remove("event_type");
            MDC.remove("user_id");
            MDC.remove("email");
            MDC.remove("ip_address");
            MDC.remove("audit");
        }
    }

    /**
     * Mask email for privacy in logs (show first char and domain).
     */
    private String maskEmail(String email) {
        if (email == null || email.isEmpty()) {
            return "[none]";
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 0) {
            return "[invalid]";
        }
        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        if (localPart.length() <= 2) {
            return localPart.charAt(0) + "***" + domain;
        }
        return localPart.charAt(0) + "***" + localPart.charAt(localPart.length() - 1) + domain;
    }
}
