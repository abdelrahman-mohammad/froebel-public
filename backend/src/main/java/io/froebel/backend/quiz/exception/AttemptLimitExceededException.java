package io.froebel.backend.quiz.exception;

/**
 * Exception thrown when a user has exceeded the maximum number of attempts for a quiz.
 */
public class AttemptLimitExceededException extends RuntimeException {
    public AttemptLimitExceededException(String message) {
        super(message);
    }

    public AttemptLimitExceededException(int maxAttempts) {
        super("Maximum attempts (" + maxAttempts + ") exceeded for this quiz");
    }
}
