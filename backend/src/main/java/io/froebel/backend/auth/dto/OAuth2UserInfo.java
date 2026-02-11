package io.froebel.backend.auth.dto;

public record OAuth2UserInfo(
    String provider,
    String providerId,
    String email,
    String name,
    String avatarUrl
) {
}
