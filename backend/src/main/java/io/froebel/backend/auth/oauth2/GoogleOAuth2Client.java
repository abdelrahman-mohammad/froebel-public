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

import java.util.Map;

@Component
public class GoogleOAuth2Client implements OAuth2ProviderClient {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuth2Client.class);

    private static final String AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

    private final WebClient webClient;
    private final String clientId;
    private final String clientSecret;
    private final String scope;

    public GoogleOAuth2Client(
        WebClient.Builder webClientBuilder,
        @Value("${spring.security.oauth2.client.registration.google.client-id:}") String clientId,
        @Value("${spring.security.oauth2.client.registration.google.client-secret:}") String clientSecret,
        @Value("${spring.security.oauth2.client.registration.google.scope:email,profile}") String scope
    ) {
        this.webClient = webClientBuilder.build();
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        // Google expects space-separated scopes
        this.scope = scope.replace(",", " ").replaceAll("\\s+", " ").trim();
    }

    @Override
    public String getProviderName() {
        return "google";
    }

    @Override
    public String getAuthorizationUrl(String state, String redirectUri) {
        return UriComponentsBuilder.fromUriString(AUTHORIZATION_URL)
            .queryParam("client_id", clientId)
            .queryParam("redirect_uri", redirectUri)
            .queryParam("response_type", "code")
            .queryParam("scope", scope)
            .queryParam("state", state)
            .queryParam("access_type", "offline")
            .queryParam("prompt", "consent")
            .build()
            .toUriString();
    }

    @Override
    public OAuth2TokenResponse exchangeCode(String code, String redirectUri) {
        try {
            return webClient.post()
                .uri(TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("code", code)
                    .with("client_id", clientId)
                    .with("client_secret", clientSecret)
                    .with("redirect_uri", redirectUri)
                    .with("grant_type", "authorization_code"))
                .retrieve()
                .bodyToMono(OAuth2TokenResponse.class)
                .block();
        } catch (WebClientResponseException e) {
            log.error("Failed to exchange code for token with Google: {}", e.getResponseBodyAsString());
            throw new OAuth2AuthenticationException("google", "Failed to exchange authorization code", e);
        } catch (Exception e) {
            log.error("Error exchanging code with Google", e);
            throw new OAuth2AuthenticationException("google", "Failed to exchange authorization code", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public OAuth2UserInfo fetchUserInfo(String accessToken) {
        try {
            Map<String, Object> userInfo = webClient.get()
                .uri(USER_INFO_URL)
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (userInfo == null) {
                throw new OAuth2AuthenticationException("google", "Failed to fetch user info");
            }

            String sub = (String) userInfo.get("sub");
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String picture = (String) userInfo.get("picture");

            if (email == null || email.isBlank()) {
                throw new OAuth2AuthenticationException("google", "Email not provided by Google");
            }

            return new OAuth2UserInfo("google", sub, email, name, picture);
        } catch (OAuth2AuthenticationException e) {
            throw e;
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch user info from Google: {}", e.getResponseBodyAsString());
            throw new OAuth2AuthenticationException("google", "Failed to fetch user info", e);
        } catch (Exception e) {
            log.error("Error fetching user info from Google", e);
            throw new OAuth2AuthenticationException("google", "Failed to fetch user info", e);
        }
    }
}
