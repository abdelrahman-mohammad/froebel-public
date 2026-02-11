package io.froebel.backend.auth.security;

import io.froebel.backend.auth.service.JwtService;
import io.froebel.backend.auth.service.TokenBlacklistService;
import io.froebel.backend.auth.util.CookieUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtAuthenticationFilter(
        JwtService jwtService,
        UserDetailsServiceImpl userDetailsService,
        TokenBlacklistService tokenBlacklistService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            String token = extractTokenFromRequest(request);

            if (StringUtils.hasText(token) && jwtService.validateToken(token)) {
                // Check if token has been blacklisted (e.g., after logout)
                if (tokenBlacklistService.isBlacklisted(token)) {
                    logger.debug("Token is blacklisted, rejecting authentication");
                    filterChain.doFilter(request, response);
                    return;
                }

                UUID userId = jwtService.extractUserId(token);
                UUID sessionId = jwtService.extractSessionId(token);
                UserDetails userDetails = userDetailsService.loadUserById(userId);

                // Set session ID if available
                if (sessionId != null && userDetails instanceof UserPrincipal principal) {
                    principal.setSessionId(sessionId);
                }

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (UsernameNotFoundException e) {
            // User was deleted but client still has valid JWT - clear stale cookies
            logger.warn("JWT references non-existent user, clearing cookies: " + e.getMessage());
            CookieUtils.clearAuthCookies(response);
        } catch (Exception e) {
            // Log the error but don't throw - let the request continue without authentication
            logger.error("Cannot set user authentication", e);
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        // First try Authorization header (for backward compatibility and OAuth callbacks)
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        // Fall back to HttpOnly cookie
        return CookieUtils.getCookieValue(request, CookieUtils.ACCESS_TOKEN_COOKIE)
            .orElse(null);
    }
}
