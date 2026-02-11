package io.froebel.backend.auth.controller;

import io.froebel.backend.auth.dto.request.ChangePasswordRequest;
import io.froebel.backend.auth.dto.request.ForgotPasswordRequest;
import io.froebel.backend.auth.dto.request.LoginRequest;
import io.froebel.backend.auth.dto.request.RefreshTokenRequest;
import io.froebel.backend.auth.dto.request.RegisterRequest;
import io.froebel.backend.auth.dto.request.ResetPasswordRequest;
import io.froebel.backend.auth.dto.request.VerifyEmailRequest;
import io.froebel.backend.auth.dto.response.AuthResponse;
import io.froebel.backend.auth.dto.response.MessageResponse;
import io.froebel.backend.auth.dto.response.TokenResponse;
import io.froebel.backend.auth.dto.response.UserResponse;
import io.froebel.backend.auth.security.UserPrincipal;
import io.froebel.backend.auth.service.AuthService;
import io.froebel.backend.auth.service.TokenBlacklistService;
import io.froebel.backend.auth.util.CookieUtils;
import io.froebel.backend.auth.util.IpAddressUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklistService tokenBlacklistService;
    private final IpAddressUtils ipAddressUtils;

    public AuthController(
        AuthService authService,
        TokenBlacklistService tokenBlacklistService,
        IpAddressUtils ipAddressUtils
    ) {
        this.authService = authService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.ipAddressUtils = ipAddressUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(
        @Valid @RequestBody RegisterRequest request,
        HttpServletRequest httpRequest
    ) {
        authService.register(request, ipAddressUtils.getClientIp(httpRequest));
        return ResponseEntity.ok(new MessageResponse("Please check your email to verify your account"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest httpRequest,
        HttpServletResponse response
    ) {
        String ipAddress = ipAddressUtils.getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        AuthResponse authResponse = authService.login(request, ipAddress, userAgent);

        // Set HttpOnly cookies for tokens
        CookieUtils.addAccessTokenCookie(response, authResponse.accessToken(), authResponse.expiresIn());
        // Refresh token expires in 7 days
        CookieUtils.addRefreshTokenCookie(response, authResponse.refreshToken(), 7 * 24 * 60 * 60);

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        // Get refresh token from HttpOnly cookie
        String refreshTokenValue = CookieUtils.getCookieValue(request, CookieUtils.REFRESH_TOKEN_COOKIE)
            .orElse(null);

        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(null);
        }

        RefreshTokenRequest refreshRequest = new RefreshTokenRequest(refreshTokenValue);
        TokenResponse tokenResponse = authService.refreshToken(refreshRequest);

        // Set HttpOnly cookies for new tokens
        CookieUtils.addAccessTokenCookie(response, tokenResponse.accessToken(), tokenResponse.expiresIn());
        // Refresh token expires in 7 days
        CookieUtils.addRefreshTokenCookie(response, tokenResponse.refreshToken(), 7 * 24 * 60 * 60);

        return ResponseEntity.ok(tokenResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal.getId()));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
        @AuthenticationPrincipal UserPrincipal principal,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        // Blacklist the access token so it can't be reused
        String accessToken = CookieUtils.getCookieValue(request, CookieUtils.ACCESS_TOKEN_COOKIE)
            .orElse(null);
        if (accessToken != null) {
            tokenBlacklistService.blacklistToken(accessToken);
        }

        // Revoke refresh tokens in database
        authService.logout(principal.getId(), principal.getEmail(), ipAddressUtils.getClientIp(request));

        // Clear auth cookies
        CookieUtils.clearAuthCookies(response);

        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(
        @Valid @RequestBody VerifyEmailRequest request,
        HttpServletRequest httpRequest
    ) {
        authService.verifyEmail(request.token(), ipAddressUtils.getClientIp(httpRequest));
        return ResponseEntity.ok(new MessageResponse("Email verified successfully"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(@RequestParam String email) {
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(new MessageResponse("If an unverified account exists with this email, a verification link has been sent"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
        @Valid @RequestBody ForgotPasswordRequest request,
        HttpServletRequest httpRequest
    ) {
        authService.forgotPassword(request.email(), ipAddressUtils.getClientIp(httpRequest));
        return ResponseEntity.ok(new MessageResponse("If an account exists with this email, a password reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
        @Valid @RequestBody ResetPasswordRequest request,
        HttpServletRequest httpRequest
    ) {
        authService.resetPassword(request.token(), request.newPassword(), ipAddressUtils.getClientIp(httpRequest));
        return ResponseEntity.ok(new MessageResponse("Password reset successfully"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ChangePasswordRequest request,
        HttpServletRequest httpRequest
    ) {
        authService.changePassword(principal.getId(), request.currentPassword(), request.newPassword(), ipAddressUtils.getClientIp(httpRequest));
        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }

    // TODO: OAuth2 endpoints (separate implementation)
    // @PostMapping("/oauth2/{provider}")
}
