package io.froebel.backend.course.exception;

import java.util.UUID;

public class NotEnrolledException extends RuntimeException {

    public NotEnrolledException(UUID courseId, UUID userId) {
        super("User " + userId + " is not enrolled in course " + courseId);
    }

    public NotEnrolledException(String message) {
        super(message);
    }
}
