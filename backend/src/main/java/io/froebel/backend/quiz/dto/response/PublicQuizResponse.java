package io.froebel.backend.quiz.dto.response;

import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.enums.QuestionType;
import io.froebel.backend.model.enums.QuizAvailabilityStatus;
import io.froebel.backend.quiz.dto.QuizSnapshot;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Response DTO for public quiz view (for taking quizzes).
 * Does not include correct answers in the question data.
 */
public record PublicQuizResponse(
    UUID id,
    String shareableId,
    String title,
    String description,
    String creatorDisplayName,
    Integer timeLimit,
    Integer passingScore,
    boolean shuffleQuestions,
    boolean shuffleChoices,
    Integer maxAttempts,
    boolean allowAnonymous,
    List<PublicQuestionResponse> questions,
    int totalPoints,
    // Scheduling fields
    Instant availableFrom,
    Instant availableUntil,
    boolean isCurrentlyAvailable,
    QuizAvailabilityStatus availabilityStatus
) {
    public record PublicQuestionResponse(
        UUID id,
        String text,
        QuestionType type,
        Integer points,
        String chapter,
        Map<String, Object> data,
        Integer questionOrder
    ) {
        public static PublicQuestionResponse from(Question question) {
            // Remove correct answers from data
            Map<String, Object> sanitizedData = sanitizeQuestionData(question.getType(), question.getData());

            return new PublicQuestionResponse(
                question.getId(),
                question.getText(),
                question.getType(),
                question.getPoints(),
                question.getChapter(),
                sanitizedData,
                question.getQuestionOrder()
            );
        }

        public static PublicQuestionResponse fromSnapshot(QuizSnapshot.QuestionSnapshot snapshot) {
            QuestionType type = QuestionType.valueOf(snapshot.type());
            Map<String, Object> sanitizedData = sanitizeQuestionData(type, snapshot.data());

            return new PublicQuestionResponse(
                snapshot.id(),
                snapshot.text(),
                type,
                snapshot.points(),
                snapshot.chapter(),
                sanitizedData,
                snapshot.questionOrder()
            );
        }

        @SuppressWarnings("unchecked")
        private static Map<String, Object> sanitizeQuestionData(QuestionType type, Map<String, Object> data) {
            if (data == null) return Map.of();

            Map<String, Object> sanitized = new HashMap<>();

            switch (type) {
                case MULTIPLE_CHOICE, MULTIPLE_ANSWER, DROPDOWN -> {
                    // Remove "correct" field from each choice
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) data.get("choices");
                    if (choices != null) {
                        List<Map<String, Object>> sanitizedChoices = choices.stream()
                            .map(choice -> {
                                Map<String, Object> c = new HashMap<>(choice);
                                c.remove("correct");
                                return c;
                            })
                            .collect(Collectors.toList());
                        sanitized.put("choices", sanitizedChoices);
                    }
                }
                case TRUE_FALSE -> {
                    // Don't include the correct answer
                }
                case FILL_IN_BLANK -> {
                    // Only include metadata, not answers
                    if (data.containsKey("inline")) {
                        sanitized.put("inline", data.get("inline"));
                    }
                    // Include blank count for UI
                    List<?> answers = (List<?>) data.get("answers");
                    if (answers != null) {
                        sanitized.put("blankCount", answers.size());
                    }
                }
                case FREE_TEXT -> {
                    // Include allowImage setting but not reference answer
                    if (data.containsKey("allowImage")) {
                        sanitized.put("allowImage", data.get("allowImage"));
                    }
                }
            }

            return sanitized;
        }
    }

    public static PublicQuizResponse from(Quiz quiz, boolean shuffle) {
        // Deduplicate questions by ID to handle Cartesian product from EntityGraph
        Map<UUID, Question> uniqueQuestions = new LinkedHashMap<>();
        for (Question q : quiz.getQuestions()) {
            uniqueQuestions.putIfAbsent(q.getId(), q);
        }

        List<PublicQuestionResponse> questionResponses = uniqueQuestions.values().stream()
            .map(PublicQuestionResponse::from)
            .collect(Collectors.toList());

        // Shuffle if required
        if (shuffle) {
            Collections.shuffle(questionResponses);
        }

        int totalPoints = uniqueQuestions.values().stream()
            .mapToInt(q -> q.getPoints() != null ? q.getPoints() : 1)
            .sum();

        return new PublicQuizResponse(
            quiz.getId(),
            quiz.getShareableId(),
            quiz.getTitle(),
            quiz.getDescription(),
            quiz.getCreator().getDisplayName(),
            quiz.getTimeLimit(),
            quiz.getPassingScore(),
            quiz.isShuffleQuestions(),
            quiz.isShuffleChoices(),
            quiz.getMaxAttempts(),
            quiz.isAllowAnonymous(),
            questionResponses,
            totalPoints,
            quiz.getAvailableFrom(),
            quiz.getAvailableUntil(),
            quiz.isCurrentlyAvailable(),
            quiz.getAvailabilityStatus()
        );
    }

    /**
     * Build a PublicQuizResponse from a published snapshot.
     * Used to serve the frozen published version to quiz takers.
     *
     * @param quiz     The quiz entity (for id, shareableId, creator, availability status)
     * @param snapshot The published snapshot to serve
     */
    public static PublicQuizResponse fromSnapshot(Quiz quiz, QuizSnapshot snapshot) {
        List<PublicQuestionResponse> questionResponses = snapshot.questions().stream()
            .map(PublicQuestionResponse::fromSnapshot)
            .collect(Collectors.toList());

        // Shuffle if required
        if (snapshot.settings().shuffleQuestions()) {
            Collections.shuffle(questionResponses);
        }

        int totalPoints = snapshot.questions().stream()
            .mapToInt(q -> q.points() != null ? q.points() : 1)
            .sum();

        return new PublicQuizResponse(
            quiz.getId(),
            quiz.getShareableId(),
            snapshot.title(),
            snapshot.description(),
            quiz.getCreator().getDisplayName(),
            snapshot.settings().timeLimit(),
            snapshot.settings().passingScore(),
            snapshot.settings().shuffleQuestions(),
            snapshot.settings().shuffleChoices(),
            snapshot.settings().maxAttempts(),
            snapshot.access().allowAnonymous(),
            questionResponses,
            totalPoints,
            snapshot.scheduling().availableFrom(),
            snapshot.scheduling().availableUntil(),
            quiz.isCurrentlyAvailable(),
            quiz.getAvailabilityStatus()
        );
    }
}
