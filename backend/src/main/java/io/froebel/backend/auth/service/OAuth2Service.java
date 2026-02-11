package io.froebel.backend.auth.service;

import io.froebel.backend.auth.dto.OAuth2TokenResponse;
import io.froebel.backend.auth.dto.OAuth2UserInfo;
import io.froebel.backend.auth.exception.OAuth2AuthenticationException;
import io.froebel.backend.auth.oauth2.OAuth2ProviderClient;
import io.froebel.backend.config.AppProperties;
import io.froebel.backend.model.entity.LinkedAccount;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.enums.Role;
import io.froebel.backend.repository.LinkedAccountRepository;
import io.froebel.backend.repository.UserRepository;
import io.froebel.backend.settings.service.NotificationPreferenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OAuth2Service {

    private static final Logger log = LoggerFactory.getLogger(OAuth2Service.class);

    private final Map<String, OAuth2ProviderClient> providerClients;
    private final OAuth2StateStore stateStore;
    private final UserRepository userRepository;
    private final LinkedAccountRepository linkedAccountRepository;
    private final AppProperties appProperties;
    private final AuditLogService auditLogService;
    private final NotificationPreferenceService notificationPreferenceService;

    public OAuth2Service(
        List<OAuth2ProviderClient> providerClientList,
        OAuth2StateStore stateStore,
        UserRepository userRepository,
        LinkedAccountRepository linkedAccountRepository,
        AppProperties appProperties,
        AuditLogService auditLogService,
        NotificationPreferenceService notificationPreferenceService
    ) {
        this.providerClients = providerClientList.stream()
            .collect(Collectors.toMap(OAuth2ProviderClient::getProviderName, Function.identity()));
        this.stateStore = stateStore;
        this.userRepository = userRepository;
        this.linkedAccountRepository = linkedAccountRepository;
        this.appProperties = appProperties;
        this.auditLogService = auditLogService;
        this.notificationPreferenceService = notificationPreferenceService;
    }

    public String buildAuthorizationUrl(String provider) {
        OAuth2ProviderClient client = getProviderClient(provider);
        String state = stateStore.generate();
        String redirectUri = buildCallbackUrl(provider);
        return client.getAuthorizationUrl(state, redirectUri);
    }

    @Transactional
    public User processCallback(String provider, String code, String state, String ipAddress) {
        // Validate state parameter (CSRF protection)
        if (!stateStore.validateAndConsume(state)) {
            log.warn("Invalid OAuth2 state parameter for provider: {}", provider);
            auditLogService.logAuthEvent(
                AuditLogService.AuthEventType.OAUTH_LOGIN_FAILED,
                null,
                ipAddress,
                "provider=" + provider + ", reason=invalid_state"
            );
            throw new OAuth2AuthenticationException(provider, "Invalid state parameter. Please try again.");
        }

        OAuth2ProviderClient client = getProviderClient(provider);
        String redirectUri = buildCallbackUrl(provider);

        // Exchange authorization code for access token
        OAuth2TokenResponse tokenResponse = client.exchangeCode(code, redirectUri);
        if (tokenResponse == null || tokenResponse.accessToken() == null) {
            auditLogService.logAuthEvent(
                AuditLogService.AuthEventType.OAUTH_LOGIN_FAILED,
                null,
                ipAddress,
                "provider=" + provider + ", reason=token_exchange_failed"
            );
            throw new OAuth2AuthenticationException(provider, "Failed to obtain access token");
        }

        // Fetch user info from provider
        OAuth2UserInfo userInfo = client.fetchUserInfo(tokenResponse.accessToken());
        log.debug("OAuth2 user info received from {}: email={}", provider, userInfo.email());

        // Find or create user
        return findOrCreateUser(userInfo, ipAddress);
    }

    private User findOrCreateUser(OAuth2UserInfo userInfo, String ipAddress) {
        // First, try to find by provider and providerId in linked_account table
        Optional<LinkedAccount> existingLinkedAccount = linkedAccountRepository.findByProviderAndProviderId(
            userInfo.provider(), userInfo.providerId()
        );

        if (existingLinkedAccount.isPresent()) {
            User user = existingLinkedAccount.get().getUser();
            log.debug("Found existing user by linked account: {}", userInfo.email());
            // Update avatar if changed
            if (userInfo.avatarUrl() != null && !userInfo.avatarUrl().equals(user.getAvatarUrl())) {
                user.setAvatarUrl(userInfo.avatarUrl());
                user = userRepository.save(user);
            }
            auditLogService.logAuthEvent(
                AuditLogService.AuthEventType.OAUTH_LOGIN_SUCCESS,
                user.getId(),
                user.getEmail(),
                ipAddress,
                "provider=" + userInfo.provider()
            );
            return user;
        }

        // Check if email already exists - if so, auto-link this provider
        Optional<User> existingByEmail = userRepository.findByEmail(userInfo.email());

        if (existingByEmail.isPresent()) {
            User existingUser = existingByEmail.get();
            // Auto-link: OAuth providers verify email ownership, so it's safe to link
            log.info("Auto-linking {} provider to existing account: {}", userInfo.provider(), userInfo.email());

            LinkedAccount newLinkedAccount = LinkedAccount.builder()
                .user(existingUser)
                .provider(userInfo.provider())
                .providerId(userInfo.providerId())
                .providerEmail(userInfo.email())
                .linkedAt(Instant.now())
                .build();
            linkedAccountRepository.save(newLinkedAccount);

            // Update avatar if user doesn't have one
            if (existingUser.getAvatarUrl() == null && userInfo.avatarUrl() != null) {
                existingUser.setAvatarUrl(userInfo.avatarUrl());
                existingUser = userRepository.save(existingUser);
            }

            auditLogService.logAuthEvent(
                AuditLogService.AuthEventType.OAUTH_LOGIN_SUCCESS,
                existingUser.getId(),
                existingUser.getEmail(),
                ipAddress,
                "provider=" + userInfo.provider() + ", auto_linked=true"
            );
            return existingUser;
        }

        // Create new user with linked account
        log.info("Creating new user from OAuth2 provider {}: {}", userInfo.provider(), userInfo.email());
        User newUser = User.builder()
            .email(userInfo.email())
            .displayName(userInfo.name() != null ? userInfo.name() : userInfo.email().split("@")[0])
            .avatarUrl(userInfo.avatarUrl())
            .role(Role.USER)
            .emailVerified(true) // OAuth emails are verified by provider
            .build();

        newUser = userRepository.save(newUser);

        // Create linked account for this provider
        LinkedAccount linkedAccount = LinkedAccount.builder()
            .user(newUser)
            .provider(userInfo.provider())
            .providerId(userInfo.providerId())
            .providerEmail(userInfo.email())
            .linkedAt(Instant.now())
            .build();
        linkedAccountRepository.save(linkedAccount);

        // Create default notification preferences
        notificationPreferenceService.createDefaultPreferences(newUser.getId());

        auditLogService.logAuthEvent(
            AuditLogService.AuthEventType.REGISTER,
            newUser.getId(),
            newUser.getEmail(),
            ipAddress,
            "provider=" + userInfo.provider()
        );

        return newUser;
    }

    private OAuth2ProviderClient getProviderClient(String provider) {
        OAuth2ProviderClient client = providerClients.get(provider.toLowerCase());
        if (client == null) {
            throw new OAuth2AuthenticationException(provider, "Unsupported OAuth2 provider: " + provider);
        }
        return client;
    }

    private String buildCallbackUrl(String provider) {
        String baseUrl = appProperties.getOauth2().getCallbackBaseUrl();
        return baseUrl + "/api/v1/auth/oauth2/callback/" + provider;
    }
}
