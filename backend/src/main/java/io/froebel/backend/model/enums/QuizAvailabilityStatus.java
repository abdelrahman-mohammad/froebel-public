package io.froebel.backend.model.enums;

public enum QuizAvailabilityStatus {
    SCHEDULED,  // Quiz will open in the future
    OPEN,       // Quiz is currently available
    CLOSED      // Quiz availability window has passed
}
