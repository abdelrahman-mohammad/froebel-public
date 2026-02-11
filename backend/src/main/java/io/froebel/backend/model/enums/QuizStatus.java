package io.froebel.backend.model.enums;

/**
 * Represents the lifecycle status of a quiz.
 */
public enum QuizStatus {
    /**
     * Quiz is being created/edited by the creator.
     * Not visible to other users.
     */
    DRAFT,

    /**
     * Quiz is published and available for taking.
     * Visible according to isPublic setting.
     */
    PUBLISHED,

    /**
     * Quiz has been archived by the creator.
     * No longer available for new attempts but history is preserved.
     */
    ARCHIVED
}
