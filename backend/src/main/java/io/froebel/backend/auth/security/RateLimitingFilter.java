package io.froebel.backend.auth.security;

import io.froebel.backend.config.AppProperties;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.Refill;
import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.codec.RedisCodec;
import io.lettuce.core.codec.StringCodec;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;
import java.util.stream.Collectors;

/**
 * Rate limiting filter for authentication endpoints.
 * Prevents brute force attacks by limiting requests per IP address.
 * Uses Redis for distributed rate limiting across multiple instances.
 * Falls back to in-memory rate limiting if Redis is unavailable.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    private final AppProperties appProperties;
    private final Set<String> trustedProxies;

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    // Redis client and proxy manager (may be null if Redis unavailable)
    private RedisClient redisClient;
    private StatefulRedisConnection<String, byte[]> redisConnection;
    private LettuceBasedProxyManager<String> proxyManager;
    private boolean useRedis = false;

    // Fallback in-memory buckets (used when Redis unavailable)
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> passwordResetBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> verificationBuckets = new ConcurrentHashMap<>();

    public RateLimitingFilter(AppProperties appProperties) {
        this.appProperties = appProperties;
        // Parse trusted proxies from configuration
        String proxiesConfig = appProperties.getRateLimiting().getTrustedProxies();
        if (proxiesConfig == null || proxiesConfig.isBlank() || proxiesConfig.equalsIgnoreCase("none")) {
            this.trustedProxies = Set.of();
        } else {
            this.trustedProxies = Arrays.stream(proxiesConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
        }
        log.info("Rate limiting initialized with trusted proxies: {}", trustedProxies);
    }

    @PostConstruct
    public void init() {
        try {
            String redisUri = redisPassword != null && !redisPassword.isEmpty()
                ? String.format("redis://:%s@%s:%d", redisPassword, redisHost, redisPort)
                : String.format("redis://%s:%d", redisHost, redisPort);

            redisClient = RedisClient.create(redisUri);
            redisConnection = redisClient.connect(RedisCodec.of(StringCodec.UTF8, ByteArrayCodec.INSTANCE));

            proxyManager = LettuceBasedProxyManager.builderFor(redisConnection)
                .withExpirationStrategy(ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(Duration.ofHours(2)))
                .build();

            // Test connection
            redisConnection.sync().ping();
            useRedis = true;
            log.info("Redis rate limiting enabled - connected to {}:{}", redisHost, redisPort);
        } catch (Exception e) {
            log.warn("Redis unavailable for rate limiting, falling back to in-memory: {}", e.getMessage());
            useRedis = false;
        }
    }

    @PreDestroy
    public void cleanup() {
        if (redisConnection != null) {
            try {
                redisConnection.close();
            } catch (Exception e) {
                log.debug("Error closing Redis connection", e);
            }
        }
        if (redisClient != null) {
            try {
                redisClient.shutdown();
            } catch (Exception e) {
                log.debug("Error shutting down Redis client", e);
            }
        }
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();
        String clientIp = getClientIp(request);

        // Only apply rate limiting to auth endpoints
        if (path.startsWith("/api/v1/auth/")) {
            Bucket bucket = getBucketForPath(path, clientIp);

            if (bucket == null) {
                // No rate limiting for this path
                filterChain.doFilter(request, response);
                return;
            }

            if (bucket.tryConsume(1)) {
                // Add rate limit headers
                response.setHeader("X-RateLimit-Remaining", String.valueOf(bucket.getAvailableTokens()));
                filterChain.doFilter(request, response);
            } else {
                log.warn("Rate limit exceeded for IP {} on path {}", clientIp, path);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write(
                    "{\"status\":429,\"message\":\"Too many requests. Please try again later.\"}"
                );
            }
        } else {
            filterChain.doFilter(request, response);
        }
    }

    private Bucket getBucketForPath(String path, String clientIp) {
        if (path.contains("/forgot-password") || path.contains("/reset-password")) {
            return getOrCreateBucket("pwd-reset:" + clientIp, this::createPasswordResetConfig, passwordResetBuckets);
        } else if (path.contains("/login") || path.contains("/register")) {
            return getOrCreateBucket("auth:" + clientIp, this::createAuthConfig, authBuckets);
        } else if (path.contains("/resend-verification") || path.contains("/verify-email")) {
            return getOrCreateBucket("verify:" + clientIp, this::createVerificationConfig, verificationBuckets);
        }
        // No rate limiting for other auth endpoints
        return null;
    }

    private Bucket getOrCreateBucket(String key, Supplier<BucketConfiguration> configSupplier, Map<String, Bucket> fallbackMap) {
        if (useRedis && proxyManager != null) {
            try {
                return proxyManager.builder().build(key, configSupplier);
            } catch (Exception e) {
                log.warn("Redis error, falling back to in-memory: {}", e.getMessage());
                useRedis = false;
            }
        }
        // Fallback to in-memory
        return fallbackMap.computeIfAbsent(key, k -> Bucket.builder()
            .addLimit(configSupplier.get().getBandwidths()[0])
            .build());
    }

    private BucketConfiguration createAuthConfig() {
        int limit = appProperties.getRateLimiting().getAuthRequestsPerMinute();
        return BucketConfiguration.builder()
            .addLimit(Bandwidth.classic(limit, Refill.intervally(limit, Duration.ofMinutes(1))))
            .build();
    }

    private BucketConfiguration createPasswordResetConfig() {
        int limit = appProperties.getRateLimiting().getPasswordResetPerHour();
        return BucketConfiguration.builder()
            .addLimit(Bandwidth.classic(limit, Refill.intervally(limit, Duration.ofHours(1))))
            .build();
    }

    private BucketConfiguration createVerificationConfig() {
        int limit = appProperties.getRateLimiting().getVerificationResendPerHour();
        return BucketConfiguration.builder()
            .addLimit(Bandwidth.classic(limit, Refill.intervally(limit, Duration.ofHours(1))))
            .build();
    }

    /**
     * Get the real client IP address, with protection against IP spoofing.
     * Only trusts X-Forwarded-For header if the request comes from a trusted proxy.
     */
    private String getClientIp(HttpServletRequest request) {
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

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Only filter POST requests to auth endpoints
        return !"POST".equalsIgnoreCase(request.getMethod());
    }
}
