package io.froebel.backend.quiz.exception;

/**
 * Exception thrown when an invalid access code is provided for a quiz.
 */
public class InvalidAccessCodeException extends RuntimeException {

    public InvalidAccessCodeException() {
        super("Invalid access code. Please enter the correct code to access this quiz.");
    }

    public InvalidAccessCodeException(String message) {
        super(message);
    }
}
