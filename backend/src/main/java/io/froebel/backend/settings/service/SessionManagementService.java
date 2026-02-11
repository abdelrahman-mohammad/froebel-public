package io.froebel.backend.settings.service;

import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.RefreshToken;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.entity.UserSession;
import io.froebel.backend.repository.UserSessionRepository;
import io.froebel.backend.settings.dto.SessionListResponse;
import io.froebel.backend.settings.dto.SessionResponse;
import io.froebel.backend.settings.util.UserAgentParser;
import io.froebel.backend.settings.util.UserAgentParser.ParsedUserAgent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class SessionManagementService {

    private static final Logger log = LoggerFactory.getLogger(SessionManagementService.class);

    private final UserSessionRepository sessionRepository;
    private final UserAgentParser userAgentParser;

    public SessionManagementService(
        UserSessionRepository sessionRepository,
        UserAgentParser userAgentParser
    ) {
        this.sessionRepository = sessionRepository;
        this.userAgentParser = userAgentParser;
    }

    @Transactional
    public UserSession createSession(User user, RefreshToken refreshToken, String ipAddress, String userAgent) {
        ParsedUserAgent parsed = userAgentParser.parse(userAgent);

        UserSession session = UserSession.builder()
            .user(user)
            .refreshToken(refreshToken)
            .deviceName(parsed.deviceName())
            .browser(parsed.browser())
            .os(parsed.os())
            .ipAddress(ipAddress)
            .isCurrent(true)
            .lastActiveAt(Instant.now())
            .build();

        log.debug("Creating session for user {} from {} ({})", user.getEmail(), ipAddress, parsed.deviceName());
        return sessionRepository.save(session);
    }

    public SessionListResponse getActiveSessions(UUID userId, UUID currentSessionId) {
        List<UserSession> sessions = sessionRepository.findByUserIdAndRevokedAtIsNullOrderByLastActiveAtDesc(userId);

        List<SessionResponse> responses = sessions.stream()
            .map(session -> {
                // Mark the current session
                if (currentSessionId != null && session.getId().equals(currentSessionId)) {
                    session.setCurrent(true);
                } else {
                    session.setCurrent(false);
                }
                return SessionResponse.from(session);
            })
            .toList();

        return SessionListResponse.from(responses);
    }

    @Transactional
    public void revokeSession(UUID userId, UUID sessionId) {
        UserSession session = sessionRepository.findByIdAndUserId(sessionId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Session", "id", sessionId));

        if (session.getRevokedAt() != null) {
            throw new IllegalStateException("Session is already revoked");
        }

        session.setRevokedAt(Instant.now());
        sessionRepository.save(session);

        log.info("Session {} revoked for user {}", sessionId, userId);
    }

    @Transactional
    public void revokeAllOtherSessions(UUID userId, UUID currentSessionId) {
        int count = sessionRepository.revokeAllOtherSessions(userId, currentSessionId, Instant.now());
        log.info("Revoked {} other sessions for user {}", count, userId);
    }

    @Transactional
    public void revokeAllSessions(UUID userId) {
        int count = sessionRepository.revokeAllUserSessions(userId, Instant.now());
        log.info("Revoked all {} sessions for user {}", count, userId);
    }

    @Transactional
    public void updateLastActive(UUID sessionId) {
        sessionRepository.updateLastActiveAt(sessionId, Instant.now());
    }

    public UUID findSessionIdByRefreshToken(UUID refreshTokenId) {
        return sessionRepository.findByRefreshTokenId(refreshTokenId)
            .map(UserSession::getId)
            .orElse(null);
    }
}
