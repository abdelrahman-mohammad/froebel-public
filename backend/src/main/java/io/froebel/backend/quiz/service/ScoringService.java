package io.froebel.backend.quiz.service;

import io.froebel.backend.model.entity.Question;
import io.froebel.backend.quiz.dto.response.AnswerResultResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ScoringService {

    public record ScoringResult(
        boolean isCorrect,
        int pointsEarned,
        Map<String, Object> correctAnswer,
        List<AnswerResultResponse.BlankResult> blankResults
    ) {
    }

    public ScoringResult scoreAnswer(Question question, Map<String, Object> userAnswer) {
        if (userAnswer == null) {
            userAnswer = Map.of();
        }

        return switch (question.getType()) {
            case MULTIPLE_CHOICE -> scoreMultipleChoice(question, userAnswer);
            case MULTIPLE_ANSWER -> scoreMultipleAnswer(question, userAnswer);
            case TRUE_FALSE -> scoreTrueFalse(question, userAnswer);
            case FILL_IN_BLANK -> scoreFillInBlank(question, userAnswer);
            case DROPDOWN -> scoreDropdown(question, userAnswer);
            case FREE_TEXT -> scoreFreeText(question, userAnswer);
            case NUMERIC -> scoreNumeric(question, userAnswer);
            case FILE_UPLOAD -> scoreFileUpload(question, userAnswer);
        };
    }

    @SuppressWarnings("unchecked")
    private ScoringResult scoreMultipleChoice(Question question, Map<String, Object> userAnswer) {
        Map<String, Object> data = question.getData();
        List<Map<String, Object>> choices = (List<Map<String, Object>>) data.get("choices");

        String userChoice = (String) userAnswer.get("selected");
        String correctId = findCorrectChoiceId(choices);

        boolean isCorrect = correctId != null && correctId.equals(userChoice);
        int pointsEarned = isCorrect ? question.getPoints() : 0;

        return new ScoringResult(
            isCorrect,
            pointsEarned,
            Map.of("selected", correctId != null ? correctId : ""),
            null
        );
    }

    @SuppressWarnings("unchecked")
    private ScoringResult scoreMultipleAnswer(Question question, Map<String, Object> userAnswer) {
        Map<String, Object> data = question.getData();
        List<Map<String, Object>> choices = (List<Map<String, Object>>) data.get("choices");

        List<String> userSelections = getStringList(userAnswer.get("selected"));
        Set<String> userSet = new HashSet<>(userSelections);

        Set<String> correctIds = new HashSet<>();
        for (Map<String, Object> choice : choices) {
            if (Boolean.TRUE.equals(choice.get("correct"))) {
                correctIds.add((String) choice.get("id"));
            }
        }

        // Count correct and incorrect selections
        int correctSelections = 0;
        int incorrectSelections = 0;

        for (String selected : userSet) {
            if (correctIds.contains(selected)) {
                correctSelections++;
            } else {
                incorrectSelections++;
            }
        }

        // Partial credit formula: max(0, (correct - incorrect) / totalCorrect) * points
        int totalCorrect = correctIds.size();
        double ratio = totalCorrect > 0 ? Math.max(0, (double) (correctSelections - incorrectSelections) / totalCorrect) : 0;
        int pointsEarned = (int) Math.round(ratio * question.getPoints());

        boolean isCorrect = correctSelections == totalCorrect && incorrectSelections == 0;

        return new ScoringResult(
            isCorrect,
            pointsEarned,
            Map.of("selected", new ArrayList<>(correctIds)),
            null
        );
    }

    private ScoringResult scoreTrueFalse(Question question, Map<String, Object> userAnswer) {
        Map<String, Object> data = question.getData();
        Boolean correctAnswer = (Boolean) data.get("correct");

        Object userValue = userAnswer.get("answer");
        Boolean userBool = null;
        if (userValue instanceof Boolean) {
            userBool = (Boolean) userValue;
        } else if (userValue instanceof String) {
            userBool = "true".equalsIgnoreCase((String) userValue);
        }

        boolean isCorrect = correctAnswer != null && correctAnswer.equals(userBool);
        int pointsEarned = isCorrect ? question.getPoints() : 0;

        return new ScoringResult(
            isCorrect,
            pointsEarned,
            Map.of("answer", correctAnswer != null ? correctAnswer : false),
            null
        );
    }

    @SuppressWarnings("unchecked")
    private ScoringResult scoreFillInBlank(Question question, Map<String, Object> userAnswer) {
        Map<String, Object> data = question.getData();
        List<?> correctAnswers = (List<?>) data.get("answers");
        boolean caseSensitive = Boolean.TRUE.equals(data.get("caseSensitive"));
        boolean isNumeric = Boolean.TRUE.equals(data.get("numeric"));
        Object toleranceValue = data.get("tolerance");
        Double tolerance = parseToleranceValue(toleranceValue, isNumeric);

        List<String> userAnswers = getStringList(userAnswer.get("answers"));

        int totalBlanks = correctAnswers.size();
        int correctBlanks = 0;
        List<AnswerResultResponse.BlankResult> blankResults = new ArrayList<>();

        for (int i = 0; i < totalBlanks; i++) {
            String userAns = i < userAnswers.size() ? userAnswers.get(i) : "";
            Object correctAns = correctAnswers.get(i);

            boolean blankCorrect = checkFillInBlankAnswer(userAns, correctAns, caseSensitive, isNumeric, tolerance);
            if (blankCorrect) {
                correctBlanks++;
            }

            String correctStr = correctAns instanceof List ? ((List<?>) correctAns).get(0).toString() : correctAns.toString();
            blankResults.add(new AnswerResultResponse.BlankResult(i, userAns, correctStr, blankCorrect));
        }

        // Partial credit: (correctBlanks / totalBlanks) * points
        double ratio = totalBlanks > 0 ? (double) correctBlanks / totalBlanks : 0;
        int pointsEarned = (int) Math.round(ratio * question.getPoints());

        boolean isCorrect = correctBlanks == totalBlanks;

        return new ScoringResult(
            isCorrect,
            pointsEarned,
            Map.of("answers", correctAnswers),
            blankResults
        );
    }

    /**
     * Parse tolerance value from question data.
     * Tolerance can be a string ("0.1", "1", "off") or a number.
     */
    private Double parseToleranceValue(Object value, boolean isNumeric) {
        if (!isNumeric || value == null) {
            return null;
        }
        if ("off".equals(value)) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        if (value instanceof String str) {
            try {
                return Double.parseDouble(str);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private boolean checkFillInBlankAnswer(String userAnswer, Object correctAnswer, boolean caseSensitive, boolean isNumeric, Double tolerance) {
        if (userAnswer == null || userAnswer.isBlank()) {
            return false;
        }

        // Handle numeric answers with tolerance
        if (isNumeric && tolerance != null) {
            return checkNumericFillInBlank(userAnswer, correctAnswer, tolerance);
        }

        String normalizedUser = caseSensitive ? userAnswer.trim() : userAnswer.trim().toLowerCase();

        if (correctAnswer instanceof List<?> acceptableAnswers) {
            // Multiple acceptable answers
            for (Object acceptable : acceptableAnswers) {
                String normalizedCorrect = caseSensitive ? acceptable.toString().trim() : acceptable.toString().trim().toLowerCase();
                if (normalizedUser.equals(normalizedCorrect)) {
                    return true;
                }
            }
            return false;
        } else {
            String normalizedCorrect = caseSensitive ? correctAnswer.toString().trim() : correctAnswer.toString().trim().toLowerCase();
            return normalizedUser.equals(normalizedCorrect);
        }
    }

    /**
     * Check numeric fill-in-blank answer with tolerance.
     */
    private boolean checkNumericFillInBlank(String userAnswer, Object correctAnswer, double tolerance) {
        Double userNum = parseNumber(userAnswer.trim());
        Double correctNum = parseCorrectNum(correctAnswer);

        if (userNum == null || correctNum == null) {
            // Fall back to string comparison if parsing fails
            return userAnswer.trim().equalsIgnoreCase(correctAnswer.toString().trim());
        }

        return Math.abs(userNum - correctNum) <= tolerance;
    }

    /**
     * Parse correct answer to number (handles List or single value).
     */
    private Double parseCorrectNum(Object correctAnswer) {
        if (correctAnswer instanceof List<?> list && !list.isEmpty()) {
            return parseNumber(list.get(0));
        }
        return parseNumber(correctAnswer);
    }

    @SuppressWarnings("unchecked")
    private ScoringResult scoreDropdown(Question question, Map<String, Object> userAnswer) {
        Map<String, Object> data = question.getData();
        List<Map<String, Object>> choices = (List<Map<String, Object>>) data.get("choices");

        // For dropdown, similar to multiple choice but may have multiple dropdowns in one question
        List<String> userSelections = getStringList(userAnswer.get("selected"));
        String correctId = findCorrectChoiceId(choices);

        // For single dropdown (most common case)
        if (userSelections.size() <= 1) {
            String userChoice = userSelections.isEmpty() ? "" : userSelections.get(0);
            boolean isCorrect = correctId != null && correctId.equals(userChoice);
            int pointsEarned = isCorrect ? question.getPoints() : 0;

            return new ScoringResult(
                isCorrect,
                pointsEarned,
                Map.of("selected", correctId != null ? correctId : ""),
                null
            );
        }

        // For multiple dropdowns: partial credit
        Set<String> correctIds = new HashSet<>();
        for (Map<String, Object> choice : choices) {
            if (Boolean.TRUE.equals(choice.get("correct"))) {
                correctIds.add((String) choice.get("id"));
            }
        }

        int correctCount = 0;
        int totalDropdowns = userSelections.size();

        for (String selected : userSelections) {
            if (correctIds.contains(selected)) {
                correctCount++;
            }
        }

        double ratio = totalDropdowns > 0 ? (double) correctCount / totalDropdowns : 0;
        int pointsEarned = (int) Math.round(ratio * question.getPoints());
        boolean isCorrect = correctCount == totalDropdowns;

        return new ScoringResult(
            isCorrect,
            pointsEarned,
            Map.of("selected", new ArrayList<>(correctIds)),
            null
        );
    }

    private ScoringResult scoreFreeText(Question question, Map<String, Object> userAnswer) {
        // Free text questions are not auto-graded
        // They require manual or AI grading
        Map<String, Object> data = question.getData();
        String referenceAnswer = data != null ? (String) data.get("referenceAnswer") : null;

        return new ScoringResult(
            false,  // Not auto-graded
            0,      // Pending grading
            referenceAnswer != null ? Map.of("referenceAnswer", referenceAnswer) : Map.of(),
            null
        );
    }

    private ScoringResult scoreNumeric(Question question, Map<String, Object> userAnswer) {
        Map<String, Object> data = question.getData();
        Number correctAnswer = (Number) data.get("correctAnswer");
        Number tolerance = (Number) data.get("tolerance");

        Object userValue = userAnswer.get("answer");
        Double userNum = parseNumber(userValue);

        if (correctAnswer == null || userNum == null) {
            return new ScoringResult(
                false,
                0,
                correctAnswer != null ? Map.of("correctAnswer", correctAnswer) : Map.of(),
                null
            );
        }

        double toleranceValue = tolerance != null ? tolerance.doubleValue() : 0.0;
        double diff = Math.abs(userNum - correctAnswer.doubleValue());
        boolean isCorrect = diff <= toleranceValue;
        int pointsEarned = isCorrect ? question.getPoints() : 0;

        return new ScoringResult(
            isCorrect,
            pointsEarned,
            Map.of("correctAnswer", correctAnswer),
            null
        );
    }

    private Double parseNumber(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private ScoringResult scoreFileUpload(Question question, Map<String, Object> userAnswer) {
        // File upload questions cannot be auto-graded
        // They require manual review
        return new ScoringResult(
            false,  // Not auto-graded
            0,      // Pending grading
            Map.of(),
            null
        );
    }

    private String findCorrectChoiceId(List<Map<String, Object>> choices) {
        for (Map<String, Object> choice : choices) {
            if (Boolean.TRUE.equals(choice.get("correct"))) {
                return (String) choice.get("id");
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private List<String> getStringList(Object value) {
        if (value == null) {
            return new ArrayList<>();
        }
        if (value instanceof List<?> list) {
            return list.stream()
                .map(Object::toString)
                .toList();
        }
        if (value instanceof String) {
            return List.of((String) value);
        }
        return new ArrayList<>();
    }
}
