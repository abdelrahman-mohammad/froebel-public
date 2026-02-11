package io.froebel.backend.auth.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;

import java.time.Duration;
import java.util.Optional;

public final class CookieUtils {

    public static final String ACCESS_TOKEN_COOKIE = "access_token";
    public static final String REFRESH_TOKEN_COOKIE = "refresh_token";

    private CookieUtils() {
        // Utility class
    }

    /**
     * Create an HttpOnly secure cookie for the access token
     */
    public static void addAccessTokenCookie(HttpServletResponse response, String token, long expiresInSeconds) {
        ResponseCookie cookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE, token)
            .httpOnly(true)
            .secure(true)
            .path("/")
            .maxAge(Duration.ofSeconds(expiresInSeconds))
            .sameSite("Strict")
            .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * Create an HttpOnly secure cookie for the refresh token
     */
    public static void addRefreshTokenCookie(HttpServletResponse response, String token, long expiresInSeconds) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, token)
            .httpOnly(true)
            .secure(true)
            .path("/api/v1/auth/refresh")
            .maxAge(Duration.ofSeconds(expiresInSeconds))
            .sameSite("Strict")
            .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    /**
     * Clear authentication cookies
     */
    public static void clearAuthCookies(HttpServletResponse response) {
        ResponseCookie accessCookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE, "")
            .httpOnly(true)
            .secure(true)
            .path("/")
            .maxAge(0)
            .sameSite("Strict")
            .build();

        ResponseCookie refreshCookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
            .httpOnly(true)
            .secure(true)
            .path("/api/v1/auth/refresh")
            .maxAge(0)
            .sameSite("Strict")
            .build();

        response.addHeader("Set-Cookie", accessCookie.toString());
        response.addHeader("Set-Cookie", refreshCookie.toString());
    }

    /**
     * Extract a cookie value by name from the request
     */
    public static Optional<String> getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }

        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return Optional.of(cookie.getValue());
            }
        }
        return Optional.empty();
    }
}
