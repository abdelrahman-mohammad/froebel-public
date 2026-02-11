package io.froebel.backend.quiz.exception;

public class QuizConflictException extends RuntimeException {
    private final Long currentVersion;

    public QuizConflictException(Long currentVersion) {
        super("Quiz was modified by another user. Please refresh and try again.");
        this.currentVersion = currentVersion;
    }

    public Long getCurrentVersion() {
        return currentVersion;
    }
}
