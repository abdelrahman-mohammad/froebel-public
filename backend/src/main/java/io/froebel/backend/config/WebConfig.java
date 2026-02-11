package io.froebel.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration.
 * Note: CORS is configured in SecurityConfig to avoid duplicate/conflicting configurations.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS configuration removed - handled by SecurityConfig.corsConfigurationSource()
    // to prevent wildcard headers and ensure consistent security policy
}
