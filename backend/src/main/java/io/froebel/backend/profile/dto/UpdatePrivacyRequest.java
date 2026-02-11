package io.froebel.backend.profile.dto;

public record UpdatePrivacyRequest(
    boolean profilePublic,
    boolean showEmail,
    boolean showStats
) {
}
