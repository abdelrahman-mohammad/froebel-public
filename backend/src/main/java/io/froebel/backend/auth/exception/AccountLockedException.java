package io.froebel.backend.auth.exception;

import java.time.Duration;

/**
 * Exception thrown when a user tries to login but their account is locked
 * due to too many failed login attempts.
 */
public class AccountLockedException extends RuntimeException {

    private final Duration remainingLockoutTime;

    public AccountLockedException(String message, Duration remainingLockoutTime) {
        super(message);
        this.remainingLockoutTime = remainingLockoutTime;
    }

    public Duration getRemainingLockoutTime() {
        return remainingLockoutTime;
    }

    public long getRemainingMinutes() {
        return remainingLockoutTime.toMinutes();
    }
}
