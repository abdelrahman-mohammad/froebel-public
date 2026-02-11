package io.froebel.backend.config;

import io.froebel.backend.auth.security.JwtAuthenticationFilter;
import io.froebel.backend.auth.security.RateLimitingFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Instant;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final AppProperties appProperties;

    public SecurityConfig(
        JwtAuthenticationFilter jwtAuthenticationFilter,
        RateLimitingFilter rateLimitingFilter,
        AppProperties appProperties
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.rateLimitingFilter = rateLimitingFilter;
        this.appProperties = appProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Configure CORS
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // Configure CSRF with double-submit cookie pattern for SPA
        // The frontend reads XSRF-TOKEN cookie and sends it in X-XSRF-TOKEN header
        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfTokenRepository.setCookiePath("/");
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        // Don't defer loading the token to ensure it's always available
        requestHandler.setCsrfRequestAttributeName(null);

        http.csrf(csrf -> csrf
            .csrfTokenRepository(csrfTokenRepository)
            .csrfTokenRequestHandler(requestHandler)
            // CSRF exemptions are carefully considered:
            // - Auth endpoints (login, register, refresh, forgot-password): Pre-auth, no CSRF token available
            // - OAuth2: Uses state parameter for CSRF protection
            // - Quiz attempts: Intentionally public for anonymous quiz-taking
            //   NOTE: This allows malicious sites to create attempts for logged-in users.
            //   Acceptable because: (1) attempts are low-value, (2) quiz results are user-specific,
            //   (3) enables anonymous quiz-taking without login. If this becomes an issue,
            //   require CSRF and accept that anonymous quiz-taking needs the XSRF-TOKEN cookie.
            // - Actuator health: Read-only monitoring endpoint
            .ignoringRequestMatchers(
                "/api/v1/auth/login",
                "/api/v1/auth/register",
                "/api/v1/auth/refresh",
                "/api/v1/auth/forgot-password",
                "/api/v1/auth/oauth2/**",
                "/api/v1/quizzes/*/attempts",
                "/api/v1/quizzes/*/attempts/*/submit",
                "/actuator/health"
            )
        );

        // Configure session management (stateless for JWT)
        http.sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

        // Configure exception handling
        http.exceptionHandling(ex -> ex
            .authenticationEntryPoint(authenticationEntryPoint())
            .accessDeniedHandler(accessDeniedHandler())
        );

        // Configure authorization rules
        http.authorizeHttpRequests(auth -> auth
            // Public auth endpoints
            .requestMatchers("/api/v1/auth/register").permitAll()
            .requestMatchers("/api/v1/auth/login").permitAll()
            .requestMatchers("/api/v1/auth/refresh").permitAll()
            .requestMatchers("/api/v1/auth/forgot-password").permitAll()
            .requestMatchers("/api/v1/auth/reset-password").permitAll()
            .requestMatchers("/api/v1/auth/verify-email").permitAll()
            .requestMatchers("/api/v1/auth/oauth2/**").permitAll()
            // Public media endpoints (for serving uploaded files)
            .requestMatchers("/api/v1/media/**").permitAll()
            // Public profile endpoints (for viewing other users' profiles)
            .requestMatchers("/api/v1/profile/public/**").permitAll()
            // Public quiz endpoints (for taking quizzes)
            .requestMatchers("/api/v1/quizzes/public").permitAll()
            .requestMatchers("/api/v1/quizzes/public/**").permitAll()
            .requestMatchers("/api/v1/quizzes/*/attempts").permitAll()
            .requestMatchers("/api/v1/quizzes/*/attempts/*/submit").permitAll()
            .requestMatchers("/api/v1/quizzes/*/attempts/*").permitAll()
            // Public course endpoints (for browsing published courses)
            .requestMatchers("/api/v1/courses/public").permitAll()
            .requestMatchers("/api/v1/courses/public/**").permitAll()
            // Public search endpoints (for searching quizzes and courses)
            .requestMatchers("/api/v1/search").permitAll()
            .requestMatchers("/api/v1/search/**").permitAll()
            // Actuator endpoints
            .requestMatchers("/actuator/health").permitAll()
            // All other endpoints require authentication
            .anyRequest().authenticated()
        );

        // Add security filters (rate limiting runs before JWT auth)
        http.addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            String json = """
                {"status":401,"message":"Authentication required","timestamp":"%s"}
                """.formatted(Instant.now());
            response.getWriter().write(json);
        };
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            String json = """
                {"status":403,"message":"Access denied","timestamp":"%s"}
                """.formatted(Instant.now());
            response.getWriter().write(json);
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(appProperties.getFrontendUrl()));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-XSRF-TOKEN"));
        configuration.setExposedHeaders(List.of("Authorization", "X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
