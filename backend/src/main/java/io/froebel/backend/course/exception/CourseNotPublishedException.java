package io.froebel.backend.course.exception;

import java.util.UUID;

public class CourseNotPublishedException extends RuntimeException {

    public CourseNotPublishedException(UUID courseId) {
        super("Course " + courseId + " is not published");
    }

    public CourseNotPublishedException(String message) {
        super(message);
    }
}
