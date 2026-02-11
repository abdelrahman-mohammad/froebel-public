package io.froebel.backend.auth.exception;

public class TwoFactorRequiredException extends RuntimeException {

    public TwoFactorRequiredException() {
        super("Two-factor authentication code is required");
    }

    public TwoFactorRequiredException(String message) {
        super(message);
    }
}
