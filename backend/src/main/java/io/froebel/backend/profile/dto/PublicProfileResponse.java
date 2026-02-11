package io.froebel.backend.profile.dto;

import io.froebel.backend.model.entity.User;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record PublicProfileResponse(
    UUID id,
    String displayName,
    String fullName,
    String bio,
    String location,
    String website,
    String avatarUrl,
    Map<String, String> socialLinks,
    Instant createdAt,
    String email,
    ProfileStatsResponse stats
) {
    public static PublicProfileResponse from(User user, ProfileStatsResponse stats) {
        return new PublicProfileResponse(
            user.getId(),
            user.getDisplayName(),
            user.getFullName(),
            user.getBio(),
            user.getLocation(),
            user.getWebsite(),
            user.getAvatarUrl(),
            user.getSocialLinks(),
            user.getCreatedAt(),
            user.isShowEmail() ? user.getEmail() : null,
            user.isShowStats() ? stats : null
        );
    }
}
