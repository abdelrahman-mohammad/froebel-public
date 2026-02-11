package io.froebel.backend.auth.dto.response;

import io.froebel.backend.model.entity.User;

import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    String displayName,
    String role,
    String avatarUrl,
    boolean emailVerified
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getDisplayName(),
            user.getRole().name(),
            user.getAvatarUrl(),
            user.isEmailVerified()
        );
    }
}
