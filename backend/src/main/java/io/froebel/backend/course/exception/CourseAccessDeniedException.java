package io.froebel.backend.course.exception;

import java.util.UUID;

public class CourseAccessDeniedException extends RuntimeException {

    public CourseAccessDeniedException(String message) {
        super(message);
    }

    public CourseAccessDeniedException(UUID courseId, UUID userId) {
        super("User " + userId + " does not have access to course " + courseId);
    }
}
