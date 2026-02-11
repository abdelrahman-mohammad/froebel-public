package io.froebel.backend.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Service for managing access token blacklist.
 * Blacklisted tokens are rejected even if they haven't expired.
 * Uses Redis for distributed storage with fallback to in-memory.
 * <p>
 * WARNING: In-memory fallback is NOT suitable for distributed deployments.
 * Tokens blacklisted on one instance won't be recognized by other instances.
 */
@Service
public class TokenBlacklistService {

    private static final Logger log = LoggerFactory.getLogger(TokenBlacklistService.class);
    private static final String BLACKLIST_KEY_PREFIX = "token:blacklist:";

    private final StringRedisTemplate redisTemplate;
    private final JwtService jwtService;

    // Fallback in-memory storage if Redis is unavailable
    private final Set<String> inMemoryBlacklist = ConcurrentHashMap.newKeySet();
    private volatile boolean redisAvailable = true;
    private volatile boolean fallbackWarningLogged = false;

    public TokenBlacklistService(StringRedisTemplate redisTemplate, JwtService jwtService) {
        this.redisTemplate = redisTemplate;
        this.jwtService = jwtService;
        checkRedisConnection();
    }

    private void checkRedisConnection() {
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            redisAvailable = true;
            log.info("TokenBlacklistService: Redis connection verified");
        } catch (Exception e) {
            redisAvailable = false;
            log.error("TokenBlacklistService: Redis unavailable at startup. Token blacklisting will use " +
                "in-memory storage which is NOT distributed. This is a SECURITY CONCERN in clustered deployments.");
        }
    }

    /**
     * Blacklist an access token by its JTI.
     * The blacklist entry expires when the token would have expired.
     *
     * @param token The JWT access token to blacklist
     */
    public void blacklistToken(String token) {
        try {
            String jti = jwtService.extractJti(token);
            if (jti == null) {
                log.warn("Cannot blacklist token without JTI");
                return;
            }

            long ttlSeconds = jwtService.getRemainingTtlSeconds(token);
            if (ttlSeconds <= 0) {
                log.debug("Token already expired, no need to blacklist");
                return;
            }

            String key = BLACKLIST_KEY_PREFIX + jti;

            if (redisAvailable) {
                try {
                    redisTemplate.opsForValue().set(key, "1", Duration.ofSeconds(ttlSeconds));
                    log.debug("Token blacklisted in Redis: {}", jti);
                    return;
                } catch (Exception e) {
                    log.warn("Redis unavailable for blacklist, falling back to in-memory: {}", e.getMessage());
                    redisAvailable = false;
                    logFallbackWarning();
                }
            }

            // Fallback to in-memory (not ideal for distributed systems)
            inMemoryBlacklist.add(jti);
            log.debug("Token blacklisted in-memory: {}", jti);
            logFallbackWarning();

            // Schedule removal after TTL (best effort cleanup)
            scheduleInMemoryCleanup(jti, ttlSeconds);

        } catch (Exception e) {
            log.error("Failed to blacklist token: {}", e.getMessage());
        }
    }

    /**
     * Check if a token is blacklisted.
     *
     * @param token The JWT access token to check
     * @return true if the token is blacklisted
     */
    public boolean isBlacklisted(String token) {
        try {
            String jti = jwtService.extractJti(token);
            if (jti == null) {
                return false;
            }

            String key = BLACKLIST_KEY_PREFIX + jti;

            if (redisAvailable) {
                try {
                    Boolean exists = redisTemplate.hasKey(key);
                    return Boolean.TRUE.equals(exists);
                } catch (Exception e) {
                    log.warn("Redis unavailable for blacklist check, using in-memory: {}", e.getMessage());
                    redisAvailable = false;
                }
            }

            // Fallback to in-memory check
            return inMemoryBlacklist.contains(jti);

        } catch (Exception e) {
            log.error("Failed to check blacklist: {}", e.getMessage());
            return false;
        }
    }

    private void logFallbackWarning() {
        if (!fallbackWarningLogged) {
            fallbackWarningLogged = true;
            log.error("SECURITY WARNING: Token blacklist is using in-memory storage. " +
                "Tokens logged out on this instance will NOT be recognized by other instances. " +
                "This can allow token reuse attacks in clustered deployments. " +
                "Ensure Redis is available for production use.");
        }
    }

    private void scheduleInMemoryCleanup(String jti, long ttlSeconds) {
        // Simple cleanup using virtual threads (Java 21+)
        Thread.startVirtualThread(() -> {
            try {
                TimeUnit.SECONDS.sleep(ttlSeconds);
                inMemoryBlacklist.remove(jti);
                log.debug("Removed expired JTI from in-memory blacklist: {}", jti);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }
}
