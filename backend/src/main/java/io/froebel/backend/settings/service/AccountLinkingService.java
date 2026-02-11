package io.froebel.backend.settings.service;

import io.froebel.backend.auth.dto.OAuth2TokenResponse;
import io.froebel.backend.auth.dto.OAuth2UserInfo;
import io.froebel.backend.auth.exception.OAuth2AuthenticationException;
import io.froebel.backend.auth.oauth2.OAuth2ProviderClient;
import io.froebel.backend.auth.service.AuditLogService;
import io.froebel.backend.config.AppProperties;
import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.LinkedAccount;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.repository.LinkedAccountRepository;
import io.froebel.backend.repository.UserRepository;
import io.froebel.backend.settings.dto.LinkedAccountResponse;
import io.froebel.backend.settings.dto.LinkedAccountsListResponse;
import io.froebel.backend.settings.exception.CannotUnlinkLastAuthMethodException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AccountLinkingService {

    private static final Logger log = LoggerFactory.getLogger(AccountLinkingService.class);
    private static final String LINK_STATE_KEY_PREFIX = "oauth2:link-state:";
    private static final List<String> SUPPORTED_PROVIDERS = Arrays.asList("google", "github", "microsoft");

    private final Map<String, OAuth2ProviderClient> providerClients;
    private final LinkedAccountRepository linkedAccountRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;
    private final AppProperties appProperties;
    private final AuditLogService auditLogService;

    // Fallback in-memory storage if Redis is unavailable
    private final ConcurrentHashMap<String, LinkStateData> inMemoryStore = new ConcurrentHashMap<>();
    private boolean redisAvailable = true;

    public AccountLinkingService(
        List<OAuth2ProviderClient> providerClientList,
        LinkedAccountRepository linkedAccountRepository,
        UserRepository userRepository,
        StringRedisTemplate redisTemplate,
        AppProperties appProperties,
        AuditLogService auditLogService
    ) {
        this.providerClients = providerClientList.stream()
            .collect(Collectors.toMap(OAuth2ProviderClient::getProviderName, Function.identity()));
        this.linkedAccountRepository = linkedAccountRepository;
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.appProperties = appProperties;
        this.auditLogService = auditLogService;
    }

    public LinkedAccountsListResponse getLinkedAccounts(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<LinkedAccount> accounts = linkedAccountRepository.findByUserId(userId);
        List<LinkedAccountResponse> responses = accounts.stream()
            .map(LinkedAccountResponse::from)
            .toList();

        boolean hasPassword = user.getPassword() != null && !user.getPassword().isBlank();

        // Determine which providers are available for linking
        Set<String> linkedProviders = accounts.stream()
            .map(LinkedAccount::getProvider)
            .collect(Collectors.toSet());
        List<String> availableProviders = SUPPORTED_PROVIDERS.stream()
            .filter(p -> !linkedProviders.contains(p))
            .toList();

        return new LinkedAccountsListResponse(responses, hasPassword, availableProviders);
    }

    public String buildLinkingUrl(UUID userId, String provider) {
        OAuth2ProviderClient client = getProviderClient(provider);

        // Check if provider is already linked
        if (linkedAccountRepository.existsByUserIdAndProvider(userId, provider)) {
            throw new IllegalStateException("Provider " + provider + " is already linked to your account");
        }

        String state = generateLinkState(userId, provider);
        String redirectUri = buildLinkCallbackUrl(provider);
        return client.getAuthorizationUrl(state, redirectUri);
    }

    @Transactional
    public LinkedAccountResponse processLinkCallback(String provider, String code, String state, String ipAddress) {
        // Validate and consume link state
        LinkStateData stateData = validateAndConsumeLinkState(state);
        if (stateData == null) {
            log.warn("Invalid link state for provider: {}", provider);
            throw new OAuth2AuthenticationException(provider, "Invalid state parameter. Please try again.");
        }

        if (!stateData.provider.equals(provider)) {
            log.warn("Provider mismatch in link state: expected {}, got {}", stateData.provider, provider);
            throw new OAuth2AuthenticationException(provider, "Invalid state parameter. Please try again.");
        }

        UUID userId = stateData.userId;

        // Verify user still exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if provider is already linked (race condition check)
        if (linkedAccountRepository.existsByUserIdAndProvider(userId, provider)) {
            throw new IllegalStateException("Provider " + provider + " is already linked to your account");
        }

        OAuth2ProviderClient client = getProviderClient(provider);
        String redirectUri = buildLinkCallbackUrl(provider);

        // Exchange code for token
        OAuth2TokenResponse tokenResponse = client.exchangeCode(code, redirectUri);
        if (tokenResponse == null || tokenResponse.accessToken() == null) {
            throw new OAuth2AuthenticationException(provider, "Failed to obtain access token");
        }

        // Fetch user info
        OAuth2UserInfo userInfo = client.fetchUserInfo(tokenResponse.accessToken());

        // Check if this OAuth account is already linked to another user
        linkedAccountRepository.findByProviderAndProviderId(provider, userInfo.providerId())
            .ifPresent(existing -> {
                if (!existing.getUser().getId().equals(userId)) {
                    throw new IllegalStateException(
                        "This " + provider + " account is already linked to another user"
                    );
                }
            });

        // Create linked account
        LinkedAccount linkedAccount = LinkedAccount.builder()
            .user(user)
            .provider(provider)
            .providerId(userInfo.providerId())
            .providerEmail(userInfo.email())
            .linkedAt(Instant.now())
            .build();
        linkedAccount = linkedAccountRepository.save(linkedAccount);

        log.info("Linked {} provider to user {}", provider, userId);
        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.OAUTH_LOGIN_SUCCESS,
            userId,
            user.getEmail(),
            ipAddress,
            "provider=" + provider + ", action=link"
        );

        return LinkedAccountResponse.from(linkedAccount);
    }

    @Transactional
    public void unlinkAccount(UUID userId, String provider, String ipAddress) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if provider is linked
        LinkedAccount linkedAccount = linkedAccountRepository.findByUserIdAndProvider(userId, provider)
            .orElseThrow(() -> new IllegalStateException("Provider " + provider + " is not linked to your account"));

        // Check if this is the last auth method
        boolean hasPassword = user.getPassword() != null && !user.getPassword().isBlank();
        long linkedCount = linkedAccountRepository.countByUserId(userId);

        if (!hasPassword && linkedCount <= 1) {
            throw new CannotUnlinkLastAuthMethodException();
        }

        linkedAccountRepository.delete(linkedAccount);

        log.info("Unlinked {} provider from user {}", provider, userId);
        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.LOGOUT,
            userId,
            user.getEmail(),
            ipAddress,
            "provider=" + provider + ", action=unlink"
        );
    }

    private OAuth2ProviderClient getProviderClient(String provider) {
        OAuth2ProviderClient client = providerClients.get(provider.toLowerCase());
        if (client == null) {
            throw new OAuth2AuthenticationException(provider, "Unsupported OAuth2 provider: " + provider);
        }
        return client;
    }

    private String buildLinkCallbackUrl(String provider) {
        String baseUrl = appProperties.getOauth2().getCallbackBaseUrl();
        return baseUrl + "/api/v1/settings/security/linked-accounts/" + provider + "/callback";
    }

    private String generateLinkState(UUID userId, String provider) {
        String stateToken = UUID.randomUUID().toString();
        String stateValue = userId.toString() + "|" + provider;
        int expiryMinutes = appProperties.getOauth2().getStateExpiryMinutes();

        if (redisAvailable) {
            try {
                String key = LINK_STATE_KEY_PREFIX + stateToken;
                redisTemplate.opsForValue().set(key, stateValue, Duration.ofMinutes(expiryMinutes));
                log.debug("Link state stored in Redis: {}", stateToken);
                return stateToken;
            } catch (Exception e) {
                log.warn("Redis unavailable for link state, falling back to in-memory: {}", e.getMessage());
                redisAvailable = false;
            }
        }

        // Fallback to in-memory
        inMemoryStore.put(stateToken, new LinkStateData(userId, provider, Instant.now()));
        log.debug("Link state stored in-memory: {}", stateToken);
        return stateToken;
    }

    private LinkStateData validateAndConsumeLinkState(String stateToken) {
        if (stateToken == null || stateToken.isBlank()) {
            return null;
        }

        int expiryMinutes = appProperties.getOauth2().getStateExpiryMinutes();

        if (redisAvailable) {
            try {
                String key = LINK_STATE_KEY_PREFIX + stateToken;
                String stateValue = redisTemplate.opsForValue().getAndDelete(key);
                if (stateValue != null) {
                    String[] parts = stateValue.split("\\|", 2);
                    if (parts.length == 2) {
                        return new LinkStateData(UUID.fromString(parts[0]), parts[1], Instant.now());
                    }
                }
                // Also check in-memory in case of previous fallback
                return validateAndConsumeFromMemory(stateToken, expiryMinutes);
            } catch (Exception e) {
                log.warn("Redis unavailable for link state validation, using in-memory: {}", e.getMessage());
                redisAvailable = false;
            }
        }

        return validateAndConsumeFromMemory(stateToken, expiryMinutes);
    }

    private LinkStateData validateAndConsumeFromMemory(String stateToken, int expiryMinutes) {
        LinkStateData data = inMemoryStore.remove(stateToken);
        if (data == null) {
            return null;
        }

        Instant expiryTime = data.createdAt.plusSeconds(expiryMinutes * 60L);
        if (Instant.now().isAfter(expiryTime)) {
            return null;
        }

        return data;
    }

    private record LinkStateData(UUID userId, String provider, Instant createdAt) {}
}
