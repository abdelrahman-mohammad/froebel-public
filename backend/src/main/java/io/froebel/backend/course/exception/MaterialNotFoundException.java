package io.froebel.backend.course.exception;

import java.util.UUID;

public class MaterialNotFoundException extends RuntimeException {

    public MaterialNotFoundException(UUID materialId) {
        super("Material not found with id: " + materialId);
    }

    public MaterialNotFoundException(UUID materialId, UUID courseId) {
        super("Material " + materialId + " not found in course " + courseId);
    }

    public MaterialNotFoundException(String message) {
        super(message);
    }
}
