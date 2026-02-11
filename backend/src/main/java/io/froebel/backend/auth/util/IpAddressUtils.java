package io.froebel.backend.auth.util;

import io.froebel.backend.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Utility for extracting client IP address from HTTP requests.
 * Handles X-Forwarded-For and X-Real-IP headers with trusted proxy validation.
 */
@Component
public class IpAddressUtils {

    private static final Logger log = LoggerFactory.getLogger(IpAddressUtils.class);

    private final Set<String> trustedProxies;

    public IpAddressUtils(AppProperties appProperties) {
        String proxiesConfig = appProperties.getRateLimiting().getTrustedProxies();
        if (proxiesConfig == null || proxiesConfig.isBlank() || proxiesConfig.equalsIgnoreCase("none")) {
            this.trustedProxies = Collections.emptySet();
        } else {
            this.trustedProxies = Arrays.stream(proxiesConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
        }
        log.info("IpAddressUtils initialized with trusted proxies: {}", trustedProxies);
    }

    /**
     * Get the real client IP address, with protection against IP spoofing.
     * Only trusts X-Forwarded-For header if the request comes from a trusted proxy.
     *
     * @param request The HTTP servlet request
     * @return The client IP address
     */
    public String getClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();

        // Only trust forwarded headers if request is from a trusted proxy
        if (trustedProxies.contains(remoteAddr)) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                // Get the first IP in the chain (original client)
                String clientIp = xForwardedFor.split(",")[0].trim();
                log.debug("Trusted proxy {} forwarded request from {}", remoteAddr, clientIp);
                return clientIp;
            }
            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty()) {
                log.debug("Trusted proxy {} forwarded request from {}", remoteAddr, xRealIp);
                return xRealIp;
            }
        } else if (request.getHeader("X-Forwarded-For") != null) {
            // Log warning if untrusted request includes forwarded headers (potential attack)
            log.warn("Ignoring X-Forwarded-For header from untrusted source: {}", remoteAddr);
        }

        return remoteAddr;
    }
}
