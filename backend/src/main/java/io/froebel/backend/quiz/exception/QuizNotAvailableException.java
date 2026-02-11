package io.froebel.backend.quiz.exception;

import java.time.Instant;

public class QuizNotAvailableException extends RuntimeException {
    private final Instant availableFrom;
    private final Instant availableUntil;

    public QuizNotAvailableException(Instant availableFrom, Instant availableUntil) {
        super(buildMessage(availableFrom, availableUntil));
        this.availableFrom = availableFrom;
        this.availableUntil = availableUntil;
    }

    private static String buildMessage(Instant from, Instant until) {
        Instant now = Instant.now();
        if (from != null && now.isBefore(from)) {
            return "This quiz is not yet available. Opens at: " + from;
        }
        if (until != null && now.isAfter(until)) {
            return "This quiz is no longer available. Closed at: " + until;
        }
        return "This quiz is not currently available";
    }

    public Instant getAvailableFrom() {
        return availableFrom;
    }

    public Instant getAvailableUntil() {
        return availableUntil;
    }
}
