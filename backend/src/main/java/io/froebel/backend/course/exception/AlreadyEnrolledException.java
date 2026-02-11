package io.froebel.backend.course.exception;

import java.util.UUID;

public class AlreadyEnrolledException extends RuntimeException {

    public AlreadyEnrolledException(UUID courseId, UUID userId) {
        super("User " + userId + " is already enrolled in course " + courseId);
    }

    public AlreadyEnrolledException(String message) {
        super(message);
    }
}
