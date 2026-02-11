package io.froebel.backend.quiz.util;

import java.security.SecureRandom;

/**
 * Generates 8-character shareable IDs for quizzes.
 * <p>
 * Uses a safe character set that avoids confusion:
 * - Letters: A-Z excluding I and O (24 letters)
 * - Numbers: 2-9 excluding 0 and 1 (8 digits)
 * <p>
 * This gives 32^8 = ~2.8 trillion possible combinations.
 */
public final class ShareableIdGenerator {

    private static final String SAFE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int ID_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private ShareableIdGenerator() {
        // Utility class - prevent instantiation
    }

    /**
     * Generate a new shareable ID.
     *
     * @return 8-character uppercase alphanumeric ID
     */
    public static String generate() {
        StringBuilder sb = new StringBuilder(ID_LENGTH);
        for (int i = 0; i < ID_LENGTH; i++) {
            sb.append(SAFE_CHARS.charAt(RANDOM.nextInt(SAFE_CHARS.length())));
        }
        return sb.toString();
    }

    /**
     * Validate that a string is a valid shareable ID format.
     *
     * @param id the ID to validate
     * @return true if the ID has valid format (8 chars, all safe characters)
     */
    public static boolean isValid(String id) {
        if (id == null || id.length() != ID_LENGTH) {
            return false;
        }
        for (char c : id.toCharArray()) {
            if (SAFE_CHARS.indexOf(c) < 0) {
                return false;
            }
        }
        return true;
    }
}
