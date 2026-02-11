package io.froebel.backend.settings.dto;

import java.util.List;

public record SessionListResponse(
    List<SessionResponse> sessions,
    int activeCount
) {
    public static SessionListResponse from(List<SessionResponse> sessions) {
        return new SessionListResponse(sessions, sessions.size());
    }
}
