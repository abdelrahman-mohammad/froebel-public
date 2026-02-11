package io.froebel.backend.quiz.exception;

/**
 * Exception thrown when a user tries to access a quiz they don't own.
 */
public class QuizAccessDeniedException extends RuntimeException {
    public QuizAccessDeniedException(String message) {
        super(message);
    }

    public QuizAccessDeniedException(String quizId, String userId) {
        super("User " + userId + " does not have access to quiz " + quizId);
    }
}
