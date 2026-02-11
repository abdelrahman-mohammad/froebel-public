package io.froebel.backend.auth.service;

import io.froebel.backend.auth.exception.InvalidTokenException;
import io.froebel.backend.auth.exception.TokenExpiredException;
import io.froebel.backend.model.entity.RefreshToken;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshTokenExpiration;

    public RefreshTokenService(
        RefreshTokenRepository refreshTokenRepository,
        @Value("${jwt.refresh-expiration:604800000}") long refreshTokenExpiration
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Revoke all existing refresh tokens for this user
        refreshTokenRepository.revokeAllByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
            .token(UUID.randomUUID().toString())
            .user(user)
            .expiryDate(Instant.now().plusMillis(refreshTokenExpiration))
            .revoked(false)
            .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
            .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new InvalidTokenException("Refresh token has been revoked");
        }

        if (refreshToken.isExpired()) {
            throw new TokenExpiredException("Refresh token has expired");
        }

        return refreshToken;
    }

    @Transactional
    public RefreshToken rotateRefreshToken(RefreshToken oldToken) {
        // Revoke the old token
        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        // Create a new token directly without revoking all tokens
        // (createRefreshToken would call revokeAllByUser, causing double revocation)
        RefreshToken newToken = RefreshToken.builder()
            .token(UUID.randomUUID().toString())
            .user(oldToken.getUser())
            .expiryDate(Instant.now().plusMillis(refreshTokenExpiration))
            .revoked(false)
            .build();

        return refreshTokenRepository.save(newToken);
    }

    @Transactional
    public void revokeRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
            .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public void revokeAllUserTokens(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }
}
