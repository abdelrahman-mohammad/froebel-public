package io.froebel.backend.auth.exception;

public class InvalidTwoFactorCodeException extends RuntimeException {

    public InvalidTwoFactorCodeException() {
        super("Invalid two-factor authentication code");
    }

    public InvalidTwoFactorCodeException(String message) {
        super(message);
    }
}
