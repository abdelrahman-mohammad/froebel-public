package io.froebel.backend.auth.service;

import io.froebel.backend.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing OAuth2 state tokens.
 * Uses Redis for distributed storage with fallback to in-memory.
 * State tokens prevent CSRF attacks in OAuth2 flow.
 */
@Service
public class OAuth2StateStore {

    private static final Logger log = LoggerFactory.getLogger(OAuth2StateStore.class);
    private static final String STATE_KEY_PREFIX = "oauth2:state:";

    private final StringRedisTemplate redisTemplate;
    private final AppProperties appProperties;

    // Fallback in-memory storage if Redis is unavailable
    private final ConcurrentHashMap<String, Instant> inMemoryStore = new ConcurrentHashMap<>();
    private boolean redisAvailable = true;

    public OAuth2StateStore(StringRedisTemplate redisTemplate, AppProperties appProperties) {
        this.redisTemplate = redisTemplate;
        this.appProperties = appProperties;
    }

    public String generate() {
        String state = UUID.randomUUID().toString();
        int expiryMinutes = appProperties.getOauth2().getStateExpiryMinutes();
        String key = STATE_KEY_PREFIX + state;

        if (redisAvailable) {
            try {
                redisTemplate.opsForValue().set(key, String.valueOf(Instant.now().toEpochMilli()),
                    Duration.ofMinutes(expiryMinutes));
                log.debug("OAuth2 state stored in Redis: {}", state);
                return state;
            } catch (Exception e) {
                log.warn("Redis unavailable for OAuth2 state, falling back to in-memory: {}", e.getMessage());
                redisAvailable = false;
            }
        }

        // Fallback to in-memory (not ideal for distributed systems)
        inMemoryStore.put(state, Instant.now());
        log.debug("OAuth2 state stored in-memory: {}", state);
        return state;
    }

    public boolean validateAndConsume(String state) {
        if (state == null || state.isBlank()) {
            return false;
        }

        String key = STATE_KEY_PREFIX + state;
        int expiryMinutes = appProperties.getOauth2().getStateExpiryMinutes();

        if (redisAvailable) {
            try {
                String createdAtMillis = redisTemplate.opsForValue().getAndDelete(key);
                if (createdAtMillis == null) {
                    // Also check in-memory in case of previous fallback
                    return validateAndConsumeFromMemory(state, expiryMinutes);
                }
                // Redis TTL handles expiry, so if we got a value, it's valid
                log.debug("OAuth2 state validated from Redis: {}", state);
                return true;
            } catch (Exception e) {
                log.warn("Redis unavailable for OAuth2 state validation, using in-memory: {}", e.getMessage());
                redisAvailable = false;
            }
        }

        return validateAndConsumeFromMemory(state, expiryMinutes);
    }

    private boolean validateAndConsumeFromMemory(String state, int expiryMinutes) {
        Instant createdAt = inMemoryStore.remove(state);
        if (createdAt == null) {
            return false;
        }

        Instant expiryTime = createdAt.plusSeconds(expiryMinutes * 60L);
        boolean valid = Instant.now().isBefore(expiryTime);
        if (valid) {
            log.debug("OAuth2 state validated from in-memory: {}", state);
        }
        return valid;
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    public void cleanup() {
        // Only cleanup in-memory store; Redis handles its own TTL expiry
        int expiryMinutes = appProperties.getOauth2().getStateExpiryMinutes();
        Instant cutoff = Instant.now().minusSeconds(expiryMinutes * 60L);

        int removed = 0;
        var iterator = inMemoryStore.entrySet().iterator();
        while (iterator.hasNext()) {
            if (iterator.next().getValue().isBefore(cutoff)) {
                iterator.remove();
                removed++;
            }
        }
        if (removed > 0) {
            log.debug("Cleaned up {} expired OAuth2 states from in-memory store", removed);
        }
    }
}
