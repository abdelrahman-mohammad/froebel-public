package io.froebel.backend.auth.oauth2;

import io.froebel.backend.auth.dto.OAuth2TokenResponse;
import io.froebel.backend.auth.dto.OAuth2UserInfo;

public interface OAuth2ProviderClient {

    String getProviderName();

    String getAuthorizationUrl(String state, String redirectUri);

    OAuth2TokenResponse exchangeCode(String code, String redirectUri);

    OAuth2UserInfo fetchUserInfo(String accessToken);
}
