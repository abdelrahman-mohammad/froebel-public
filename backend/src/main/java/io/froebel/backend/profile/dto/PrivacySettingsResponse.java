package io.froebel.backend.profile.dto;

public record PrivacySettingsResponse(
    boolean profilePublic,
    boolean showEmail,
    boolean showStats
) {
}
