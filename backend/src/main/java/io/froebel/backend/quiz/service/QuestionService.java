package io.froebel.backend.quiz.service;

import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.quiz.dto.request.CreateQuestionRequest;
import io.froebel.backend.quiz.dto.request.ReorderQuestionsRequest;
import io.froebel.backend.quiz.dto.request.UpdateQuestionRequest;
import io.froebel.backend.quiz.dto.response.QuestionResponse;
import io.froebel.backend.quiz.validation.QuestionDataValidator;
import io.froebel.backend.repository.QuestionRepository;
import io.froebel.backend.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final QuizService quizService;
    private final QuestionDataValidator questionDataValidator;

    public QuestionService(
        QuestionRepository questionRepository,
        QuizRepository quizRepository,
        QuizService quizService,
        QuestionDataValidator questionDataValidator
    ) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
        this.quizService = quizService;
        this.questionDataValidator = questionDataValidator;
    }

    @Transactional
    public QuestionResponse addQuestionByShareableId(String shareableId, UUID userId, CreateQuestionRequest request) {
        Quiz quiz = quizService.findOwnedQuizByShareableId(shareableId, userId);
        return addQuestionToQuiz(quiz, request);
    }

    @Transactional
    public QuestionResponse addQuestion(UUID quizId, UUID userId, CreateQuestionRequest request) {
        Quiz quiz = quizService.findOwnedQuiz(quizId, userId);
        return addQuestionToQuiz(quiz, request);
    }

    private QuestionResponse addQuestionToQuiz(Quiz quiz, CreateQuestionRequest request) {

        // Validate question data
        questionDataValidator.validate(request.type(), request.data());

        // Get next order
        int nextOrder = questionRepository.findMaxQuestionOrderByQuizId(quiz.getId()) + 1;

        Question question = Question.builder()
            .quiz(quiz)
            .text(request.text())
            .type(request.type())
            .points(request.points())
            .chapter(request.chapter())
            .explanation(request.explanation())
            .hintCorrect(request.hintCorrect())
            .hintWrong(request.hintWrong())
            .identifier(request.identifier())
            .data(request.data())
            .questionOrder(nextOrder)
            .build();

        question = questionRepository.save(question);

        // Update quiz timestamp to trigger @Version increment
        quiz.setUpdatedAt(Instant.now());
        quizRepository.saveAndFlush(quiz);

        return QuestionResponse.from(question);
    }

    @Transactional
    public QuestionResponse updateQuestionByShareableId(String shareableId, UUID questionId, UUID userId, UpdateQuestionRequest request) {
        Quiz quiz = quizService.findOwnedQuizByShareableId(shareableId, userId);
        return updateQuestionInternal(quiz.getId(), questionId, request);
    }

    @Transactional
    public QuestionResponse updateQuestion(UUID quizId, UUID questionId, UUID userId, UpdateQuestionRequest request) {
        // Verify ownership
        quizService.findOwnedQuiz(quizId, userId);
        return updateQuestionInternal(quizId, questionId, request);
    }

    private QuestionResponse updateQuestionInternal(UUID quizId, UUID questionId, UpdateQuestionRequest request) {
        Question question = findQuestionByIdAndQuizId(questionId, quizId);

        // Validate question data
        questionDataValidator.validate(request.type(), request.data());

        question.setText(request.text());
        question.setType(request.type());
        question.setPoints(request.points());
        question.setChapter(request.chapter());
        question.setExplanation(request.explanation());
        question.setHintCorrect(request.hintCorrect());
        question.setHintWrong(request.hintWrong());
        question.setIdentifier(request.identifier());
        question.setData(request.data());

        question = questionRepository.save(question);

        // Update quiz timestamp to trigger @Version increment
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        quiz.setUpdatedAt(Instant.now());
        quizRepository.saveAndFlush(quiz);

        return QuestionResponse.from(question);
    }

    @Transactional
    public void deleteQuestionByShareableId(String shareableId, UUID questionId, UUID userId) {
        Quiz quiz = quizService.findOwnedQuizByShareableId(shareableId, userId);
        deleteQuestionInternal(quiz.getId(), questionId);
    }

    @Transactional
    public void deleteQuestion(UUID quizId, UUID questionId, UUID userId) {
        // Verify ownership
        quizService.findOwnedQuiz(quizId, userId);
        deleteQuestionInternal(quizId, questionId);
    }

    private void deleteQuestionInternal(UUID quizId, UUID questionId) {
        Question question = findQuestionByIdAndQuizId(questionId, quizId);
        questionRepository.delete(question);

        // Re-order remaining questions
        reorderAfterDeletion(quizId, question.getQuestionOrder());
    }

    @Transactional
    public List<QuestionResponse> reorderQuestionsByShareableId(String shareableId, UUID userId, ReorderQuestionsRequest request) {
        Quiz quiz = quizService.findOwnedQuizByShareableId(shareableId, userId);
        return reorderQuestionsInternal(quiz.getId(), request);
    }

    @Transactional
    public List<QuestionResponse> reorderQuestions(UUID quizId, UUID userId, ReorderQuestionsRequest request) {
        // Verify ownership
        quizService.findOwnedQuiz(quizId, userId);
        return reorderQuestionsInternal(quizId, request);
    }

    private List<QuestionResponse> reorderQuestionsInternal(UUID quizId, ReorderQuestionsRequest request) {
        // Build a map of questionId -> order
        Map<UUID, Integer> orderMap = request.questionOrders().stream()
            .collect(Collectors.toMap(
                ReorderQuestionsRequest.QuestionOrderItem::questionId,
                ReorderQuestionsRequest.QuestionOrderItem::order
            ));

        // Get all questions for this quiz
        List<Question> questions = questionRepository.findByQuizId(quizId);

        // Update orders
        for (Question question : questions) {
            Integer newOrder = orderMap.get(question.getId());
            if (newOrder != null) {
                question.setQuestionOrder(newOrder);
            }
        }

        questionRepository.saveAll(questions);

        // Update quiz timestamp to trigger @Version increment
        // This ensures hasUnpublishedChanges detects reordering
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        quiz.setUpdatedAt(Instant.now());
        quizRepository.saveAndFlush(quiz);

        // Return updated questions in order
        return questionRepository.findByQuizIdOrderByQuestionOrderAsc(quizId).stream()
            .map(QuestionResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestionsByShareableId(String shareableId, UUID userId) {
        Quiz quiz = quizService.findOwnedQuizByShareableId(shareableId, userId);
        return questionRepository.findByQuizIdOrderByQuestionOrderAsc(quiz.getId()).stream()
            .map(QuestionResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestions(UUID quizId, UUID userId) {
        // Verify ownership
        quizService.findOwnedQuiz(quizId, userId);

        return questionRepository.findByQuizIdOrderByQuestionOrderAsc(quizId).stream()
            .map(QuestionResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestionByShareableId(String shareableId, UUID questionId, UUID userId) {
        Quiz quiz = quizService.findOwnedQuizByShareableId(shareableId, userId);
        Question question = findQuestionByIdAndQuizId(questionId, quiz.getId());
        return QuestionResponse.from(question);
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestion(UUID quizId, UUID questionId, UUID userId) {
        // Verify ownership
        quizService.findOwnedQuiz(quizId, userId);

        Question question = findQuestionByIdAndQuizId(questionId, quizId);
        return QuestionResponse.from(question);
    }

    private Question findQuestionByIdAndQuizId(UUID questionId, UUID quizId) {
        return questionRepository.findByIdAndQuizId(questionId, quizId)
            .orElseThrow(() -> new ResourceNotFoundException("Question", "id", questionId));
    }

    private void reorderAfterDeletion(UUID quizId, int deletedOrder) {
        List<Question> questionsAfter = questionRepository.findByQuizIdOrderByQuestionOrderAsc(quizId).stream()
            .filter(q -> q.getQuestionOrder() > deletedOrder)
            .toList();

        for (Question question : questionsAfter) {
            question.setQuestionOrder(question.getQuestionOrder() - 1);
        }

        if (!questionsAfter.isEmpty()) {
            questionRepository.saveAll(questionsAfter);
        }

        // Update quiz timestamp to trigger @Version increment
        // This ensures hasUnpublishedChanges detects the deletion
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        quiz.setUpdatedAt(Instant.now());
        quizRepository.saveAndFlush(quiz);
    }
}
