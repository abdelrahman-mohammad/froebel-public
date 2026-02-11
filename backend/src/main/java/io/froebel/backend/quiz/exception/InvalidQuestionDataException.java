package io.froebel.backend.quiz.exception;

/**
 * Exception thrown when question data does not match the expected format for its type.
 */
public class InvalidQuestionDataException extends RuntimeException {
    public InvalidQuestionDataException(String message) {
        super(message);
    }

    public InvalidQuestionDataException(String questionType, String reason) {
        super("Invalid data for " + questionType + " question: " + reason);
    }
}
