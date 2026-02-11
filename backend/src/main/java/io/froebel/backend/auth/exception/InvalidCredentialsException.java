package io.froebel.backend.auth.exception;

public class InvalidCredentialsException extends AuthenticationException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
