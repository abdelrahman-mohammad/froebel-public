package io.froebel.backend.quiz.exception;

/**
 * Exception thrown when trying to take a quiz that is not published.
 */
public class QuizNotPublishedException extends RuntimeException {
    public QuizNotPublishedException(String message) {
        super(message);
    }

    public QuizNotPublishedException() {
        super("This quiz is not available for taking");
    }
}
