package io.froebel.backend.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record OAuth2TokenResponse(
    @JsonProperty("access_token")
    String accessToken,

    @JsonProperty("token_type")
    String tokenType,

    @JsonProperty("scope")
    String scope,

    @JsonProperty("expires_in")
    Integer expiresIn,

    @JsonProperty("refresh_token")
    String refreshToken
) {
}
