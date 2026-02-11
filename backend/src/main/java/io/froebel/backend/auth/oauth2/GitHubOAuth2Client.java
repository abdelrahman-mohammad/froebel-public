package io.froebel.backend.auth.oauth2;

import io.froebel.backend.auth.dto.OAuth2TokenResponse;
import io.froebel.backend.auth.dto.OAuth2UserInfo;
import io.froebel.backend.auth.exception.OAuth2AuthenticationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Component
public class GitHubOAuth2Client implements OAuth2ProviderClient {

    private static final Logger log = LoggerFactory.getLogger(GitHubOAuth2Client.class);

    private static final String AUTHORIZATION_URL = "https://github.com/login/oauth/authorize";
    private static final String TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String USER_INFO_URL = "https://api.github.com/user";
    private static final String USER_EMAILS_URL = "https://api.github.com/user/emails";

    private final WebClient webClient;
    private final String clientId;
    private final String clientSecret;
    private final String scope;

    public GitHubOAuth2Client(
        WebClient.Builder webClientBuilder,
        @Value("${spring.security.oauth2.client.registration.github.client-id:}") String clientId,
        @Value("${spring.security.oauth2.client.registration.github.client-secret:}") String clientSecret,
        @Value("${spring.security.oauth2.client.registration.github.scope:user:email,read:user}") String scope
    ) {
        this.webClient = webClientBuilder.build();
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        // GitHub expects space-separated scopes
        this.scope = scope.replace(",", " ").replaceAll("\\s+", " ").trim();
    }

    @Override
    public String getProviderName() {
        return "github";
    }

    @Override
    public String getAuthorizationUrl(String state, String redirectUri) {
        return UriComponentsBuilder.fromUriString(AUTHORIZATION_URL)
            .queryParam("client_id", clientId)
            .queryParam("redirect_uri", redirectUri)
            .queryParam("scope", scope)
            .queryParam("state", state)
            .build()
            .toUriString();
    }

    @Override
    public OAuth2TokenResponse exchangeCode(String code, String redirectUri) {
        try {
            return webClient.post()
                .uri(TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .accept(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromFormData("code", code)
                    .with("client_id", clientId)
                    .with("client_secret", clientSecret)
                    .with("redirect_uri", redirectUri))
                .retrieve()
                .bodyToMono(OAuth2TokenResponse.class)
                .block();
        } catch (WebClientResponseException e) {
            log.error("Failed to exchange code for token with GitHub: {}", e.getResponseBodyAsString());
            throw new OAuth2AuthenticationException("github", "Failed to exchange authorization code", e);
        } catch (Exception e) {
            log.error("Error exchanging code with GitHub", e);
            throw new OAuth2AuthenticationException("github", "Failed to exchange authorization code", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public OAuth2UserInfo fetchUserInfo(String accessToken) {
        try {
            // Fetch basic user info
            Map<String, Object> userInfo = webClient.get()
                .uri(USER_INFO_URL)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (userInfo == null) {
                throw new OAuth2AuthenticationException("github", "Failed to fetch user info");
            }

            String id = String.valueOf(userInfo.get("id"));
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String login = (String) userInfo.get("login");
            String avatarUrl = (String) userInfo.get("avatar_url");

            // GitHub may not include email in the user info response
            // We need to fetch it from the emails endpoint
            if (email == null || email.isBlank()) {
                email = fetchPrimaryEmail(accessToken);
            }

            if (email == null || email.isBlank()) {
                throw new OAuth2AuthenticationException("github", "Email not provided by GitHub. Please make sure your email is public or grant email access.");
            }

            // Use name if available, otherwise fall back to login (username)
            String displayName = (name != null && !name.isBlank()) ? name : login;

            return new OAuth2UserInfo("github", id, email, displayName, avatarUrl);
        } catch (OAuth2AuthenticationException e) {
            throw e;
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch user info from GitHub: {}", e.getResponseBodyAsString());
            throw new OAuth2AuthenticationException("github", "Failed to fetch user info", e);
        } catch (Exception e) {
            log.error("Error fetching user info from GitHub", e);
            throw new OAuth2AuthenticationException("github", "Failed to fetch user info", e);
        }
    }

    @SuppressWarnings("unchecked")
    private String fetchPrimaryEmail(String accessToken) {
        try {
            List<Map<String, Object>> emails = webClient.get()
                .uri(USER_EMAILS_URL)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .bodyToMono(List.class)
                .block();

            if (emails == null || emails.isEmpty()) {
                return null;
            }

            // Find the primary verified email
            for (Map<String, Object> emailInfo : emails) {
                Boolean primary = (Boolean) emailInfo.get("primary");
                Boolean verified = (Boolean) emailInfo.get("verified");
                if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified)) {
                    return (String) emailInfo.get("email");
                }
            }

            // If no primary email, find any verified email
            for (Map<String, Object> emailInfo : emails) {
                Boolean verified = (Boolean) emailInfo.get("verified");
                if (Boolean.TRUE.equals(verified)) {
                    return (String) emailInfo.get("email");
                }
            }

            return null;
        } catch (Exception e) {
            log.warn("Failed to fetch emails from GitHub", e);
            return null;
        }
    }
}
