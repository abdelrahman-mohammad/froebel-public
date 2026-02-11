package io.froebel.backend.auth.exception;

public class OAuth2AuthenticationException extends AuthenticationException {

    private final String provider;

    public OAuth2AuthenticationException(String provider, String message) {
        super(message);
        this.provider = provider;
    }

    public OAuth2AuthenticationException(String provider, String message, Throwable cause) {
        super(message, cause);
        this.provider = provider;
    }

    public String getProvider() {
        return provider;
    }
}
