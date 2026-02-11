package io.froebel.backend.auth.exception;

public class TokenExpiredException extends AuthenticationException {

    public TokenExpiredException(String message) {
        super(message);
    }
}
