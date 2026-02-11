package io.froebel.backend.quiz.exception;

/**
 * Exception thrown when a user's IP address is not in the allowed list.
 */
public class IpNotAllowedException extends RuntimeException {
    private final String clientIp;

    public IpNotAllowedException(String clientIp) {
        super("Access denied. Your IP address (" + clientIp + ") is not authorized to take this quiz.");
        this.clientIp = clientIp;
    }

    public String getClientIp() {
        return clientIp;
    }
}
