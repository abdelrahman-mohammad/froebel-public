package io.froebel.backend.settings.exception;

public class CannotUnlinkLastAuthMethodException extends RuntimeException {

    public CannotUnlinkLastAuthMethodException() {
        super("Cannot unlink the last authentication method. Set a password first or keep at least one OAuth provider linked.");
    }

    public CannotUnlinkLastAuthMethodException(String message) {
        super(message);
    }
}
