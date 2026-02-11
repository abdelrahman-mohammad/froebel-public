package io.froebel.backend.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey key;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtService(
        @Value("${jwt.secret}") String secret,
        @Value("${jwt.expiration}") long accessTokenExpiration,
        @Value("${jwt.refresh-expiration:604800000}") long refreshTokenExpiration
    ) {
        validateJwtSecret(secret);
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    private void validateJwtSecret(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                "JWT_SECRET environment variable is required. " +
                    "Generate one with: openssl rand -base64 32"
            );
        }
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                "JWT_SECRET must be at least 32 bytes (256 bits) for HS512. " +
                    "Generate one with: openssl rand -base64 32"
            );
        }
    }

    public String generateAccessToken(UUID userId, String email, String role) {
        return generateAccessToken(userId, email, role, null);
    }

    public String generateAccessToken(UUID userId, String email, String role, UUID sessionId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiration);

        var builder = Jwts.builder()
            .id(UUID.randomUUID().toString()) // JTI for token blacklisting
            .subject(userId.toString())
            .claim("email", email)
            .claim("role", role)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key, Jwts.SIG.HS512);

        if (sessionId != null) {
            builder.claim("sid", sessionId.toString());
        }

        return builder.compact();
    }

    public UUID extractUserId(String token) {
        Claims claims = parseToken(token);
        return UUID.fromString(claims.getSubject());
    }

    public String extractEmail(String token) {
        return parseToken(token).get("email", String.class);
    }

    public String extractRole(String token) {
        return parseToken(token).get("role", String.class);
    }

    public String extractJti(String token) {
        return parseToken(token).getId();
    }

    public UUID extractSessionId(String token) {
        String sid = parseToken(token).get("sid", String.class);
        return sid != null ? UUID.fromString(sid) : null;
    }

    /**
     * Get the remaining time-to-live for a token in seconds.
     * Returns 0 if token is expired.
     */
    public long getRemainingTtlSeconds(String token) {
        try {
            Claims claims = parseToken(token);
            Date expiration = claims.getExpiration();
            long remainingMs = expiration.getTime() - System.currentTimeMillis();
            return Math.max(0, remainingMs / 1000);
        } catch (ExpiredJwtException e) {
            return 0;
        }
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (JwtException e) {
            return true;
        }
    }

    private Claims parseToken(String token) {
        // Algorithm confusion attacks are prevented by verifyWith(key)
        // which validates the token was signed with our HMAC key
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }
}
