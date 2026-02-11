package io.froebel.backend.quiz.service;

import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.enums.QuestionType;
import io.froebel.backend.model.enums.QuizStatus;
import io.froebel.backend.quiz.dto.response.QuizDetailResponse;
import io.froebel.backend.quiz.dto.response.QuizExportResponse;
import io.froebel.backend.quiz.exception.InvalidQuestionDataException;
import io.froebel.backend.quiz.util.ShareableIdGenerator;
import io.froebel.backend.quiz.validation.QuestionDataValidator;
import io.froebel.backend.repository.QuizRepository;
import io.froebel.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class QuizImportExportService {

    // Import size limits to prevent DoS attacks
    private static final int MAX_QUESTIONS_PER_QUIZ = 500;
    private static final int MAX_CHOICES_PER_QUESTION = 20;
    private static final int MAX_TITLE_LENGTH = 255;
    private static final int MAX_DESCRIPTION_LENGTH = 10_000;

    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuizService quizService;
    private final QuestionDataValidator questionDataValidator;

    public QuizImportExportService(
        QuizRepository quizRepository,
        UserRepository userRepository,
        QuizService quizService,
        QuestionDataValidator questionDataValidator
    ) {
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.quizService = quizService;
        this.questionDataValidator = questionDataValidator;
    }

    public QuizExportResponse exportQuiz(UUID quizId, UUID userId, boolean includeAnswers) {
        Quiz quiz = quizService.findOwnedQuiz(quizId, userId);
        return QuizExportResponse.from(quiz, includeAnswers);
    }

    public QuizExportResponse exportQuizByShareableId(String shareableId, UUID userId, boolean includeAnswers) {
        Quiz quiz = quizService.findOwnedQuizByShareableId(shareableId, userId);
        return QuizExportResponse.from(quiz, includeAnswers);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public QuizDetailResponse importQuiz(UUID userId, Map<String, Object> quizData) {
        User creator = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Handle nested quiz object (from CanvasQuizReplay format)
        Map<String, Object> data = quizData;
        if (quizData.containsKey("quiz")) {
            data = (Map<String, Object>) quizData.get("quiz");
        }

        // Validate import size limits
        validateImportLimits(data);

        // Extract quiz metadata
        String title = getStringValue(data, "title", "Imported Quiz");
        String description = getStringValue(data, "description", null);
        Integer timeLimit = getIntegerValue(data, "timeLimit");

        // Create quiz
        Quiz quiz = Quiz.builder()
            .title(title)
            .shareableId(generateUniqueShareableId())
            .description(description)
            .timeLimit(timeLimit)
            .creator(creator)
            .status(QuizStatus.DRAFT)
            .isPublic(true)
            .build();

        // Parse and add questions
        List<?> questionsData = (List<?>) data.get("questions");
        if (questionsData != null) {
            List<Question> questions = new ArrayList<>();
            int order = 0;

            for (Object qObj : questionsData) {
                if (qObj instanceof Map) {
                    Map<String, Object> qData = (Map<String, Object>) qObj;
                    Question question = parseQuestion(qData, quiz, order++);
                    questions.add(question);
                }
            }

            quiz.setQuestions(questions);
        }

        quiz = quizRepository.save(quiz);
        // Return QuizDetailResponse for full data including questions list
        return QuizDetailResponse.from(quiz, false);
    }

    @SuppressWarnings("unchecked")
    private Question parseQuestion(Map<String, Object> qData, Quiz quiz, int order) {
        String typeStr = getStringValue(qData, "type", "multiple_choice");
        QuestionType type = parseQuestionType(typeStr);

        String text = getStringValue(qData, "text", "");
        Integer points = getIntegerValue(qData, "points");
        if (points == null) points = 1;
        // Validate points range (same as CreateQuestionRequest validation: 1-100)
        if (points < 1 || points > 100) {
            throw new InvalidQuestionDataException("Points must be between 1 and 100, got: " + points);
        }

        String chapter = getStringValue(qData, "chapter", null);
        String explanation = getStringValue(qData, "explanation", null);

        // Build question data based on type
        Map<String, Object> questionData = buildQuestionData(type, qData);

        // Validate the data - strict mode: fail on any invalid data
        questionDataValidator.validate(type, questionData);

        return Question.builder()
            .quiz(quiz)
            .text(text)
            .type(type)
            .points(points)
            .chapter(chapter)
            .explanation(explanation)
            .data(questionData)
            .questionOrder(order)
            .build();
    }

    private QuestionType parseQuestionType(String typeStr) {
        if (typeStr == null) return QuestionType.MULTIPLE_CHOICE;

        return switch (typeStr.toLowerCase().replace("_", "").replace("-", "")) {
            case "multiplechoice" -> QuestionType.MULTIPLE_CHOICE;
            case "multipleanswer" -> QuestionType.MULTIPLE_ANSWER;
            case "truefalse" -> QuestionType.TRUE_FALSE;
            case "fillinblank", "fillblank" -> QuestionType.FILL_IN_BLANK;
            case "dropdown" -> QuestionType.DROPDOWN;
            case "freetext", "essay" -> QuestionType.FREE_TEXT;
            default -> QuestionType.MULTIPLE_CHOICE;
        };
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> buildQuestionData(QuestionType type, Map<String, Object> qData) {
        Map<String, Object> data = new HashMap<>();

        switch (type) {
            case MULTIPLE_CHOICE, MULTIPLE_ANSWER, DROPDOWN -> {
                List<?> choices = (List<?>) qData.get("choices");
                if (choices != null) {
                    List<Map<String, Object>> normalizedChoices = new ArrayList<>();
                    int idx = 0;
                    for (Object c : choices) {
                        if (c instanceof Map) {
                            Map<String, Object> choice = (Map<String, Object>) c;
                            Map<String, Object> normalized = new HashMap<>();
                            normalized.put("id", choice.getOrDefault("id", String.valueOf((char) ('a' + idx))));
                            normalized.put("text", choice.getOrDefault("text", ""));
                            normalized.put("correct", Boolean.TRUE.equals(choice.get("correct")));
                            normalizedChoices.add(normalized);
                            idx++;
                        }
                    }
                    data.put("choices", normalizedChoices);
                }
            }
            case TRUE_FALSE -> {
                Boolean correct = (Boolean) qData.get("correct");
                data.put("correct", correct != null ? correct : false);
            }
            case FILL_IN_BLANK -> {
                List<?> answers = (List<?>) qData.get("answers");
                if (answers != null) {
                    data.put("answers", new ArrayList<>(answers));
                }
                if (qData.containsKey("caseSensitive")) {
                    data.put("caseSensitive", qData.get("caseSensitive"));
                }
                if (qData.containsKey("inline")) {
                    data.put("inline", qData.get("inline"));
                }
            }
            case FREE_TEXT -> {
                if (qData.containsKey("correct_answer") || qData.containsKey("referenceAnswer")) {
                    data.put("referenceAnswer", qData.getOrDefault("referenceAnswer", qData.get("correct_answer")));
                }
                if (qData.containsKey("allow_image") || qData.containsKey("allowImage")) {
                    data.put("allowImage", qData.getOrDefault("allowImage", qData.get("allow_image")));
                }
            }
        }

        return data;
    }

    private String getStringValue(Map<String, Object> data, String key, String defaultValue) {
        Object value = data.get(key);
        if (value instanceof String) {
            String str = ((String) value).trim();
            return str.isEmpty() ? defaultValue : str;
        }
        return defaultValue;
    }

    private Integer getIntegerValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Integer) {
            return (Integer) value;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private String generateUniqueShareableId() {
        for (int i = 0; i < 10; i++) {
            String id = ShareableIdGenerator.generate();
            if (!quizRepository.existsByShareableId(id)) {
                return id;
            }
        }
        throw new IllegalStateException("Failed to generate unique shareable ID after 10 attempts");
    }

    /**
     * Validate import data against size limits to prevent DoS attacks.
     */
    @SuppressWarnings("unchecked")
    private void validateImportLimits(Map<String, Object> data) {
        // Validate title length
        Object title = data.get("title");
        if (title instanceof String && ((String) title).length() > MAX_TITLE_LENGTH) {
            throw new InvalidQuestionDataException("Quiz title exceeds maximum length of " + MAX_TITLE_LENGTH);
        }

        // Validate description length
        Object description = data.get("description");
        if (description instanceof String && ((String) description).length() > MAX_DESCRIPTION_LENGTH) {
            throw new InvalidQuestionDataException("Quiz description exceeds maximum length of " + MAX_DESCRIPTION_LENGTH);
        }

        // Validate questions count
        Object questions = data.get("questions");
        if (questions instanceof List<?> questionList) {
            if (questionList.size() > MAX_QUESTIONS_PER_QUIZ) {
                throw new InvalidQuestionDataException(
                    "Quiz exceeds maximum of " + MAX_QUESTIONS_PER_QUIZ + " questions (found " + questionList.size() + ")");
            }

            // Validate choices count per question
            for (Object q : questionList) {
                if (q instanceof Map) {
                    Map<String, Object> questionData = (Map<String, Object>) q;
                    Object choices = questionData.get("choices");
                    if (choices instanceof List<?> choiceList && choiceList.size() > MAX_CHOICES_PER_QUESTION) {
                        throw new InvalidQuestionDataException(
                            "Question exceeds maximum of " + MAX_CHOICES_PER_QUESTION + " choices (found " + choiceList.size() + ")");
                    }
                }
            }
        }
    }
}
