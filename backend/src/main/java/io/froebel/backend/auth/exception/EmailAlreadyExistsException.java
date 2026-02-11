package io.froebel.backend.auth.exception;

public class EmailAlreadyExistsException extends AuthenticationException {

    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
