package io.froebel.backend.settings.dto;

import io.froebel.backend.model.entity.UserSession;

import java.time.Instant;
import java.util.UUID;

public record SessionResponse(
    UUID id,
    String deviceName,
    String browser,
    String os,
    String ipAddress,
    String country,
    String city,
    boolean isCurrent,
    Instant lastActiveAt,
    Instant createdAt
) {
    public static SessionResponse from(UserSession session) {
        return new SessionResponse(
            session.getId(),
            session.getDeviceName(),
            session.getBrowser(),
            session.getOs(),
            session.getIpAddress(),
            session.getCountry(),
            session.getCity(),
            session.isCurrent(),
            session.getLastActiveAt(),
            session.getCreatedAt()
        );
    }
}
