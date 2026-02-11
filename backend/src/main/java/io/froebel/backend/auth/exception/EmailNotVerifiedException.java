package io.froebel.backend.auth.exception;

public class EmailNotVerifiedException extends AuthenticationException {

    public EmailNotVerifiedException(String message) {
        super(message);
    }
}
