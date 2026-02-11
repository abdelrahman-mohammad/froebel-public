package io.froebel.backend.profile.dto;

import io.froebel.backend.model.entity.User;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record ProfileResponse(
    UUID id,
    String email,
    String displayName,
    String fullName,
    String bio,
    String location,
    String website,
    String avatarUrl,
    Map<String, String> socialLinks,
    String role,
    boolean emailVerified,
    Instant createdAt,
    PrivacySettingsResponse privacy,
    ProfileStatsResponse stats
) {
    public static ProfileResponse from(User user, ProfileStatsResponse stats) {
        return new ProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getDisplayName(),
            user.getFullName(),
            user.getBio(),
            user.getLocation(),
            user.getWebsite(),
            user.getAvatarUrl(),
            user.getSocialLinks(),
            user.getRole().name(),
            user.isEmailVerified(),
            user.getCreatedAt(),
            new PrivacySettingsResponse(
                user.isProfilePublic(),
                user.isShowEmail(),
                user.isShowStats()
            ),
            stats
        );
    }
}
