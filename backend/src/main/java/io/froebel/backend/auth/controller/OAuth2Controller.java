package io.froebel.backend.auth.controller;

import io.froebel.backend.auth.exception.OAuth2AuthenticationException;
import io.froebel.backend.auth.service.JwtService;
import io.froebel.backend.auth.service.OAuth2Service;
import io.froebel.backend.auth.service.RefreshTokenService;
import io.froebel.backend.auth.util.CookieUtils;
import io.froebel.backend.auth.util.IpAddressUtils;
import io.froebel.backend.config.AppProperties;
import io.froebel.backend.model.entity.RefreshToken;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.entity.UserSession;
import io.froebel.backend.settings.service.SessionManagementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/auth/oauth2")
public class OAuth2Controller {

    private static final Logger log = LoggerFactory.getLogger(OAuth2Controller.class);

    private final OAuth2Service oauth2Service;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final SessionManagementService sessionManagementService;
    private final AppProperties appProperties;
    private final IpAddressUtils ipAddressUtils;

    public OAuth2Controller(
        OAuth2Service oauth2Service,
        JwtService jwtService,
        RefreshTokenService refreshTokenService,
        SessionManagementService sessionManagementService,
        AppProperties appProperties,
        IpAddressUtils ipAddressUtils
    ) {
        this.oauth2Service = oauth2Service;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.sessionManagementService = sessionManagementService;
        this.appProperties = appProperties;
        this.ipAddressUtils = ipAddressUtils;
    }

    @GetMapping("/{provider}")
    public void authorize(
        @PathVariable String provider,
        HttpServletResponse response
    ) throws IOException {
        log.debug("Initiating OAuth2 flow for provider: {}", provider);
        String authorizationUrl = oauth2Service.buildAuthorizationUrl(provider);
        response.sendRedirect(authorizationUrl);
    }

    @GetMapping("/callback/{provider}")
    public void callback(
        @PathVariable String provider,
        @RequestParam String code,
        @RequestParam String state,
        HttpServletRequest request,
        HttpServletResponse response
    ) throws IOException {
        try {
            log.debug("Processing OAuth2 callback for provider: {}", provider);

            // Process the OAuth2 callback and get/create user
            String ipAddress = ipAddressUtils.getClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            User user = oauth2Service.processCallback(provider, code, state, ipAddress);

            // Create refresh token and session
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
            UserSession session = sessionManagementService.createSession(user, refreshToken, ipAddress, userAgent);

            // Generate JWT tokens with session ID
            String accessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                session.getId()
            );

            // Set HttpOnly cookies for tokens (more secure than URL fragments)
            long accessTokenExpiry = jwtService.getAccessTokenExpiration() / 1000; // seconds
            long refreshTokenExpiry = jwtService.getRefreshTokenExpiration() / 1000; // seconds
            CookieUtils.addAccessTokenCookie(response, accessToken, accessTokenExpiry);
            CookieUtils.addRefreshTokenCookie(response, refreshToken.getToken(), refreshTokenExpiry);

            // Redirect to frontend with success indicator (no tokens in URL)
            String redirectUrl = buildSuccessRedirectUrl();
            log.debug("OAuth2 login successful for user: {}", user.getEmail());

            response.sendRedirect(redirectUrl);

        } catch (OAuth2AuthenticationException e) {
            log.error("OAuth2 authentication failed for provider {}: {}", provider, e.getMessage());
            String errorUrl = buildErrorRedirectUrl(e.getMessage());
            response.sendRedirect(errorUrl);
        } catch (Exception e) {
            log.error("Unexpected error during OAuth2 callback for provider: {}", provider, e);
            String errorUrl = buildErrorRedirectUrl("Authentication failed. Please try again.");
            response.sendRedirect(errorUrl);
        }
    }

    private String buildSuccessRedirectUrl() {
        String frontendUrl = appProperties.getFrontendUrl();
        String callbackPath = appProperties.getOauth2().getFrontendCallbackPath();
        // Tokens are now in HttpOnly cookies, just indicate success
        return frontendUrl + callbackPath + "?success=true";
    }

    private String buildErrorRedirectUrl(String errorMessage) {
        String frontendUrl = appProperties.getFrontendUrl();
        String callbackPath = appProperties.getOauth2().getFrontendCallbackPath();
        String encodedError = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);

        return frontendUrl + callbackPath + "?error=" + encodedError;
    }

}
