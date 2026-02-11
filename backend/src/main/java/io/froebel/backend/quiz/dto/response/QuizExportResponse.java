package io.froebel.backend.quiz.dto.response;

import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.enums.QuestionType;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Response for exporting quiz to JSON format.
 * Compatible with the legacy CanvasQuizReplay import format.
 * <p>
 * When includeAnswers=false, correct answer information is stripped to allow
 * safe sharing of exports without revealing answers.
 */
public record QuizExportResponse(
    String title,
    String description,
    Integer timeLimit,
    List<Map<String, Object>> questions
) {
    /**
     * Export quiz with answers included (for backup/migration).
     */
    public static QuizExportResponse from(Quiz quiz) {
        return from(quiz, true);
    }

    /**
     * Export quiz with control over answer visibility.
     * @param includeAnswers true to include correct answers, false to strip them
     */
    public static QuizExportResponse from(Quiz quiz, boolean includeAnswers) {
        // Deduplicate questions by ID to handle Cartesian product from EntityGraph
        Map<UUID, Question> uniqueQuestions = new LinkedHashMap<>();
        for (Question q : quiz.getQuestions()) {
            uniqueQuestions.putIfAbsent(q.getId(), q);
        }

        List<Map<String, Object>> exportedQuestions = uniqueQuestions.values().stream()
            .map(q -> {
                Map<String, Object> questionMap = new LinkedHashMap<>();
                questionMap.put("type", q.getType().name().toLowerCase());
                questionMap.put("text", q.getText());
                questionMap.put("points", q.getPoints());

                if (q.getChapter() != null) {
                    questionMap.put("chapter", q.getChapter());
                }

                // Only include explanation if answers are shown
                if (includeAnswers && q.getExplanation() != null) {
                    questionMap.put("explanation", q.getExplanation());
                }

                // Merge question data with answer filtering
                if (q.getData() != null) {
                    Map<String, Object> data = new LinkedHashMap<>(q.getData());

                    if (!includeAnswers) {
                        // Strip answer-revealing fields based on question type
                        stripAnswers(data, q.getType());
                    }

                    questionMap.putAll(data);
                }

                return questionMap;
            })
            .collect(Collectors.toList());

        return new QuizExportResponse(
            quiz.getTitle(),
            quiz.getDescription(),
            quiz.getTimeLimit(),
            exportedQuestions
        );
    }

    /**
     * Remove answer-revealing fields from question data.
     */
    @SuppressWarnings("unchecked")
    private static void stripAnswers(Map<String, Object> data, QuestionType type) {
        switch (type) {
            case MULTIPLE_CHOICE, MULTIPLE_ANSWER, DROPDOWN -> {
                // Remove 'correct' field from choices
                Object choices = data.get("choices");
                if (choices instanceof List<?> choiceList) {
                    List<Map<String, Object>> strippedChoices = new ArrayList<>();
                    for (Object choice : choiceList) {
                        if (choice instanceof Map) {
                            Map<String, Object> original = (Map<String, Object>) choice;
                            Map<String, Object> stripped = new LinkedHashMap<>();
                            stripped.put("id", original.get("id"));
                            stripped.put("text", original.get("text"));
                            // Do NOT include 'correct' field
                            strippedChoices.add(stripped);
                        }
                    }
                    data.put("choices", strippedChoices);
                }
            }
            case TRUE_FALSE -> {
                // Remove correct answer
                data.remove("correct");
            }
            case FILL_IN_BLANK -> {
                // Remove expected answers
                data.remove("answers");
            }
            case FREE_TEXT -> {
                // Remove reference answer
                data.remove("referenceAnswer");
            }
            case NUMERIC -> {
                // Remove expected value and tolerance
                data.remove("answer");
                data.remove("tolerance");
            }
            case FILE_UPLOAD -> {
                // No answer data to strip for file uploads
            }
        }

        // Remove hints that reveal answers
        data.remove("hintCorrect");
        data.remove("hintWrong");
    }
}
