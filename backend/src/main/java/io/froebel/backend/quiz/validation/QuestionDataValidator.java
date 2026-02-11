package io.froebel.backend.quiz.validation;

import io.froebel.backend.model.enums.QuestionType;
import io.froebel.backend.quiz.exception.InvalidQuestionDataException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class QuestionDataValidator {

    public void validate(QuestionType type, Map<String, Object> data) {
        if (data == null) {
            throw new InvalidQuestionDataException(type.name(), "data cannot be null");
        }

        switch (type) {
            case MULTIPLE_CHOICE -> validateMultipleChoice(data);
            case MULTIPLE_ANSWER -> validateMultipleAnswer(data);
            case TRUE_FALSE -> validateTrueFalse(data);
            case FILL_IN_BLANK -> validateFillInBlank(data);
            case DROPDOWN -> validateDropdown(data);
            case FREE_TEXT -> validateFreeText(data);
            case NUMERIC -> validateNumeric(data);
            case FILE_UPLOAD -> validateFileUpload(data);
        }
    }

    @SuppressWarnings("unchecked")
    private void validateMultipleChoice(Map<String, Object> data) {
        List<Map<String, Object>> choices = getChoices(data, "MULTIPLE_CHOICE");

        if (choices.size() < 2) {
            throw new InvalidQuestionDataException("MULTIPLE_CHOICE", "must have at least 2 choices");
        }

        long correctCount = choices.stream()
            .filter(c -> Boolean.TRUE.equals(c.get("correct")))
            .count();

        if (correctCount != 1) {
            throw new InvalidQuestionDataException("MULTIPLE_CHOICE", "must have exactly 1 correct answer");
        }

        validateChoiceStructure(choices, "MULTIPLE_CHOICE");
    }

    @SuppressWarnings("unchecked")
    private void validateMultipleAnswer(Map<String, Object> data) {
        List<Map<String, Object>> choices = getChoices(data, "MULTIPLE_ANSWER");

        if (choices.size() < 2) {
            throw new InvalidQuestionDataException("MULTIPLE_ANSWER", "must have at least 2 choices");
        }

        long correctCount = choices.stream()
            .filter(c -> Boolean.TRUE.equals(c.get("correct")))
            .count();

        if (correctCount < 1) {
            throw new InvalidQuestionDataException("MULTIPLE_ANSWER", "must have at least 1 correct answer");
        }

        validateChoiceStructure(choices, "MULTIPLE_ANSWER");
    }

    private void validateTrueFalse(Map<String, Object> data) {
        if (!data.containsKey("correct")) {
            throw new InvalidQuestionDataException("TRUE_FALSE", "must have 'correct' field");
        }

        Object correct = data.get("correct");
        if (!(correct instanceof Boolean)) {
            throw new InvalidQuestionDataException("TRUE_FALSE", "'correct' must be a boolean");
        }
    }

    @SuppressWarnings("unchecked")
    private void validateFillInBlank(Map<String, Object> data) {
        if (!data.containsKey("answers")) {
            throw new InvalidQuestionDataException("FILL_IN_BLANK", "must have 'answers' field");
        }

        Object answersObj = data.get("answers");
        if (!(answersObj instanceof List<?> answers)) {
            throw new InvalidQuestionDataException("FILL_IN_BLANK", "'answers' must be an array");
        }

        if (answers.isEmpty()) {
            throw new InvalidQuestionDataException("FILL_IN_BLANK", "must have at least 1 answer");
        }

        for (Object answer : answers) {
            if (!(answer instanceof String) && !(answer instanceof List)) {
                throw new InvalidQuestionDataException("FILL_IN_BLANK",
                    "each answer must be a string or array of acceptable strings");
            }
        }
    }

    @SuppressWarnings("unchecked")
    private void validateDropdown(Map<String, Object> data) {
        List<Map<String, Object>> choices = getChoices(data, "DROPDOWN");

        if (choices.size() < 2) {
            throw new InvalidQuestionDataException("DROPDOWN", "must have at least 2 choices");
        }

        long correctCount = choices.stream()
            .filter(c -> Boolean.TRUE.equals(c.get("correct")))
            .count();

        if (correctCount != 1) {
            throw new InvalidQuestionDataException("DROPDOWN", "must have exactly 1 correct answer");
        }

        validateChoiceStructure(choices, "DROPDOWN");
    }

    private void validateFreeText(Map<String, Object> data) {
        // FREE_TEXT is flexible - referenceAnswer and allowImage are optional
        if (data.containsKey("allowImage")) {
            Object allowImage = data.get("allowImage");
            if (!(allowImage instanceof Boolean)) {
                throw new InvalidQuestionDataException("FREE_TEXT", "'allowImage' must be a boolean");
            }
        }
    }

    private void validateNumeric(Map<String, Object> data) {
        if (!data.containsKey("correctAnswer")) {
            throw new InvalidQuestionDataException("NUMERIC", "must have 'correctAnswer' field");
        }

        Object correctAnswer = data.get("correctAnswer");
        if (!(correctAnswer instanceof Number)) {
            throw new InvalidQuestionDataException("NUMERIC", "'correctAnswer' must be a number");
        }

        // Tolerance is optional but if present must be a non-negative number with reasonable max
        if (data.containsKey("tolerance")) {
            Object tolerance = data.get("tolerance");
            if (tolerance != null && !(tolerance instanceof Number)) {
                throw new InvalidQuestionDataException("NUMERIC", "'tolerance' must be a number or null");
            }
            if (tolerance instanceof Number) {
                double toleranceValue = ((Number) tolerance).doubleValue();
                if (toleranceValue < 0) {
                    throw new InvalidQuestionDataException("NUMERIC", "'tolerance' must be non-negative");
                }
                if (toleranceValue > 1_000_000) {
                    throw new InvalidQuestionDataException("NUMERIC", "'tolerance' cannot exceed 1,000,000");
                }
            }
        }

        // Unit is optional string
        if (data.containsKey("unit")) {
            Object unit = data.get("unit");
            if (unit != null && !(unit instanceof String)) {
                throw new InvalidQuestionDataException("NUMERIC", "'unit' must be a string");
            }
        }
    }

    @SuppressWarnings("unchecked")
    private void validateFileUpload(Map<String, Object> data) {
        if (!data.containsKey("acceptedTypes")) {
            throw new InvalidQuestionDataException("FILE_UPLOAD", "must have 'acceptedTypes' field");
        }

        Object acceptedTypesObj = data.get("acceptedTypes");
        if (!(acceptedTypesObj instanceof List<?> acceptedTypes)) {
            throw new InvalidQuestionDataException("FILE_UPLOAD", "'acceptedTypes' must be an array");
        }

        if (acceptedTypes.isEmpty()) {
            throw new InvalidQuestionDataException("FILE_UPLOAD", "must have at least 1 accepted file type");
        }

        for (Object type : acceptedTypes) {
            if (!(type instanceof String) || ((String) type).isBlank()) {
                throw new InvalidQuestionDataException("FILE_UPLOAD",
                    "each accepted type must be a non-empty string");
            }
        }

        if (!data.containsKey("maxFileSizeMB")) {
            throw new InvalidQuestionDataException("FILE_UPLOAD", "must have 'maxFileSizeMB' field");
        }

        Object maxSizeObj = data.get("maxFileSizeMB");
        if (!(maxSizeObj instanceof Number)) {
            throw new InvalidQuestionDataException("FILE_UPLOAD", "'maxFileSizeMB' must be a number");
        }

        int maxSize = ((Number) maxSizeObj).intValue();
        if (maxSize < 1) {
            throw new InvalidQuestionDataException("FILE_UPLOAD", "'maxFileSizeMB' must be at least 1");
        }
        if (maxSize > 100) {
            throw new InvalidQuestionDataException("FILE_UPLOAD", "'maxFileSizeMB' cannot exceed 100 MB");
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getChoices(Map<String, Object> data, String type) {
        if (!data.containsKey("choices")) {
            throw new InvalidQuestionDataException(type, "must have 'choices' field");
        }

        Object choicesObj = data.get("choices");
        if (!(choicesObj instanceof List<?> choicesList)) {
            throw new InvalidQuestionDataException(type, "'choices' must be an array");
        }

        // Validate each choice is a Map object
        for (int i = 0; i < choicesList.size(); i++) {
            Object choice = choicesList.get(i);
            if (!(choice instanceof Map)) {
                throw new InvalidQuestionDataException(type, "choice " + i + " must be an object");
            }
        }

        return (List<Map<String, Object>>) choicesObj;
    }

    private void validateChoiceStructure(List<Map<String, Object>> choices, String type) {
        java.util.Set<Object> seenIds = new java.util.HashSet<>();

        for (int i = 0; i < choices.size(); i++) {
            Map<String, Object> choice = choices.get(i);

            if (!choice.containsKey("id")) {
                throw new InvalidQuestionDataException(type, "choice " + i + " must have 'id' field");
            }

            Object id = choice.get("id");
            if (seenIds.contains(id)) {
                throw new InvalidQuestionDataException(type, "duplicate choice id '" + id + "' found");
            }
            seenIds.add(id);

            if (!choice.containsKey("text")) {
                throw new InvalidQuestionDataException(type, "choice " + i + " must have 'text' field");
            }

            Object text = choice.get("text");
            if (!(text instanceof String textStr) || ((String) text).isBlank()) {
                throw new InvalidQuestionDataException(type, "choice " + i + " 'text' must be a non-empty string");
            }
            // Validate choice text max length (2000 characters to match question text limit)
            if (textStr.length() > 2000) {
                throw new InvalidQuestionDataException(type, "choice " + i + " 'text' cannot exceed 2000 characters");
            }
        }
    }
}
