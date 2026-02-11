package io.froebel.backend.quiz.service;

import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.entity.QuizAnswer;
import io.froebel.backend.model.entity.QuizAttempt;
import io.froebel.backend.model.entity.QuizHistory;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.quiz.dto.request.StartAttemptRequest;
import io.froebel.backend.quiz.dto.request.SubmitAnswersRequest;
import io.froebel.backend.quiz.dto.response.AnswerResultResponse;
import io.froebel.backend.quiz.dto.response.AttemptResponse;
import io.froebel.backend.quiz.dto.response.AttemptResultResponse;
import io.froebel.backend.quiz.dto.response.PublicQuizResponse;
import io.froebel.backend.quiz.exception.AttemptLimitExceededException;
import io.froebel.backend.quiz.exception.InvalidAccessCodeException;
import io.froebel.backend.quiz.exception.IpNotAllowedException;
import io.froebel.backend.quiz.exception.QuizNotAvailableException;
import io.froebel.backend.quiz.exception.QuizNotPublishedException;
import io.froebel.backend.repository.QuestionRepository;
import io.froebel.backend.repository.QuizAnswerRepository;
import io.froebel.backend.repository.QuizAttemptRepository;
import io.froebel.backend.repository.QuizHistoryRepository;
import io.froebel.backend.repository.QuizRepository;
import io.froebel.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class QuizTakingService {

    private static final int ANONYMOUS_ATTEMPT_LIMIT = 3;

    private final QuizRepository quizRepository;
    private final QuizHistoryRepository quizHistoryRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizAnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final ScoringService scoringService;
    private final PasswordEncoder passwordEncoder;

    public QuizTakingService(
        QuizRepository quizRepository,
        QuizHistoryRepository quizHistoryRepository,
        QuizAttemptRepository attemptRepository,
        QuizAnswerRepository answerRepository,
        QuestionRepository questionRepository,
        UserRepository userRepository,
        ScoringService scoringService,
        PasswordEncoder passwordEncoder
    ) {
        this.quizRepository = quizRepository;
        this.quizHistoryRepository = quizHistoryRepository;
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.scoringService = scoringService;
        this.passwordEncoder = passwordEncoder;
    }

    public PublicQuizResponse getPublicQuiz(UUID quizId) {
        Quiz quiz = findPublishedQuiz(quizId);
        return getPublishedContent(quiz);
    }

    public PublicQuizResponse getPublicQuizByShareableId(String shareableId) {
        return getPublicQuizByShareableId(shareableId, null);
    }

    public PublicQuizResponse getPublicQuizByShareableId(String shareableId, String accessCode) {
        Quiz quiz = findPublishedQuizByShareableId(shareableId);

        // Validate access code if required (prevents viewing quiz content without code)
        validateAccessCode(quiz, accessCode);

        return getPublishedContent(quiz);
    }

    /**
     * Get the published content for a quiz.
     * Serves from the frozen published snapshot if available, otherwise falls back to live entity.
     */
    private PublicQuizResponse getPublishedContent(Quiz quiz) {
        Integer publishedVersion = quiz.getPublishedVersionNumber();

        if (publishedVersion == null) {
            // Legacy quiz without published version - serve live entity
            return PublicQuizResponse.from(quiz, quiz.isShuffleQuestions());
        }

        QuizHistory history = quizHistoryRepository
            .findByQuizIdAndVersionNumber(quiz.getId(), publishedVersion)
            .orElse(null);

        if (history == null) {
            // Snapshot not found - fall back to live entity
            return PublicQuizResponse.from(quiz, quiz.isShuffleQuestions());
        }

        // Serve from the frozen published snapshot
        return PublicQuizResponse.fromSnapshot(quiz, history.getSnapshot());
    }

    public Quiz findPublishedQuizByShareableId(String shareableId) {
        Quiz quiz = quizRepository.findWithDetailsByShareableId(shareableId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz", "shareableId", shareableId));

        if (!quiz.isPublished()) {
            throw new QuizNotPublishedException();
        }

        if (!quiz.isCurrentlyAvailable()) {
            throw new QuizNotAvailableException(
                quiz.getAvailableFrom(),
                quiz.getAvailableUntil()
            );
        }

        return quiz;
    }

    @Transactional
    public AttemptResponse startAttemptByShareableId(
        String shareableId,
        UUID userId,
        String ipAddress,
        StartAttemptRequest request
    ) {
        Quiz quiz = findPublishedQuizByShareableId(shareableId);
        return startAttemptInternal(quiz, userId, ipAddress, request);
    }

    @Transactional
    public AttemptResponse startAttempt(
        UUID quizId,
        UUID userId,
        String ipAddress,
        StartAttemptRequest request
    ) {
        Quiz quiz = findPublishedQuiz(quizId);
        return startAttemptInternal(quiz, userId, ipAddress, request);
    }

    private AttemptResponse startAttemptInternal(
        Quiz quiz,
        UUID userId,
        String ipAddress,
        StartAttemptRequest request
    ) {
        // Check if anonymous is allowed when no user
        if (userId == null && !quiz.isAllowAnonymous()) {
            throw new QuizNotPublishedException("This quiz requires authentication");
        }

        // Validate IP address if filtering is enabled
        validateIpAddress(quiz, ipAddress);

        // Validate access code if required
        validateAccessCode(quiz, request.accessCode());

        // Check attempt limits
        checkAttemptLimits(quiz, userId, ipAddress, request);

        // Check for existing in-progress attempt
        QuizAttempt existingAttempt = findInProgressAttempt(quiz.getId(), userId, ipAddress, request.anonymousSessionId());
        if (existingAttempt != null) {
            return AttemptResponse.from(existingAttempt);
        }

        // Create new attempt with version tracking
        QuizAttempt attempt = QuizAttempt.builder()
            .quiz(quiz)
            .quizVersionNumber(quiz.getPublishedVersionNumber())  // Capture published version for accurate scoring
            .ipAddress(ipAddress)
            .startedAt(Instant.now())
            .build();

        if (userId != null) {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            attempt.setUser(user);
        } else {
            attempt.setAnonymousName(request.anonymousName());
            attempt.setAnonymousEmail(request.anonymousEmail());
            attempt.setAnonymousSessionId(request.anonymousSessionId());
        }

        attempt = attemptRepository.save(attempt);
        return AttemptResponse.from(attempt);
    }

    @Transactional
    public AttemptResultResponse submitAnswers(
        UUID quizId,
        UUID attemptId,
        UUID userId,
        String ipAddress,
        String sessionId,
        SubmitAnswersRequest request
    ) {
        Quiz quiz = findPublishedQuiz(quizId);
        return submitAnswersInternal(quiz, attemptId, userId, ipAddress, sessionId, request);
    }

    private AttemptResultResponse submitAnswersInternal(
        Quiz quiz,
        UUID attemptId,
        UUID userId,
        String ipAddress,
        String sessionId,
        SubmitAnswersRequest request
    ) {
        QuizAttempt attempt = findAttempt(attemptId, quiz.getId(), userId, ipAddress, sessionId);

        if (attempt.isCompleted()) {
            // Return existing results
            return buildAttemptResult(attempt, quiz);
        }

        // Get all questions for this quiz
        Map<UUID, Question> questionMap = questionRepository.findByQuizId(quiz.getId()).stream()
            .collect(Collectors.toMap(Question::getId, Function.identity()));

        // Process each answer
        int totalScore = 0;
        int maxScore = 0;
        List<QuizAnswer> answers = new ArrayList<>();

        for (SubmitAnswersRequest.AnswerSubmission submission : request.answers()) {
            Question question = questionMap.get(submission.questionId());
            if (question == null) {
                continue; // Skip unknown questions
            }

            maxScore += question.getPoints();

            // Score the answer
            ScoringService.ScoringResult result = scoringService.scoreAnswer(question, submission.answerData());
            totalScore += result.pointsEarned();

            QuizAnswer answer = QuizAnswer.builder()
                .attempt(attempt)
                .question(question)
                .answerData(submission.answerData())
                .isCorrect(result.isCorrect())
                .pointsEarned(result.pointsEarned())
                .timeTakenSeconds(submission.timeTakenSeconds())
                .answeredAt(Instant.now())
                .build();

            answers.add(answer);
        }

        // Save all answers
        answerRepository.saveAll(answers);

        // Calculate time taken
        int timeTakenSeconds = (int) java.time.Duration.between(attempt.getStartedAt(), Instant.now()).getSeconds();

        // Calculate percentage
        BigDecimal percentage = maxScore > 0
            ? BigDecimal.valueOf(totalScore * 100.0 / maxScore).setScale(2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // Check if passed
        boolean passed = quiz.getPassingScore() == null || percentage.intValue() >= quiz.getPassingScore();

        // Update attempt
        attempt.setScore(totalScore);
        attempt.setMaxScore(maxScore);
        attempt.setPercentage(percentage);
        attempt.setPassed(passed);
        attempt.setCompletedAt(Instant.now());
        attempt.setTimeTakenSeconds(timeTakenSeconds);
        // Add answers to existing collection (don't replace - orphanRemoval requires modifying in place)
        attempt.getAnswers().addAll(answers);

        attempt = attemptRepository.save(attempt);

        return buildAttemptResult(attempt, quiz);
    }

    public AttemptResultResponse getAttemptResult(
        UUID quizId,
        UUID attemptId,
        UUID userId,
        String ipAddress,
        String sessionId
    ) {
        Quiz quiz = findPublishedQuiz(quizId);
        QuizAttempt attempt = findAttempt(attemptId, quizId, userId, ipAddress, sessionId);

        if (!attempt.isCompleted()) {
            throw new ResourceNotFoundException("Attempt results", "id", attemptId);
        }

        return buildAttemptResult(attempt, quiz);
    }

    @Transactional
    public AttemptResultResponse submitAnswersByShareableId(
        String shareableId,
        UUID attemptId,
        UUID userId,
        String ipAddress,
        String sessionId,
        SubmitAnswersRequest request
    ) {
        Quiz quiz = findPublishedQuizByShareableId(shareableId);
        return submitAnswersInternal(quiz, attemptId, userId, ipAddress, sessionId, request);
    }

    public AttemptResultResponse getAttemptResultByShareableId(
        String shareableId,
        UUID attemptId,
        UUID userId,
        String ipAddress,
        String sessionId
    ) {
        Quiz quiz = findPublishedQuizByShareableId(shareableId);
        QuizAttempt attempt = findAttempt(attemptId, quiz.getId(), userId, ipAddress, sessionId);

        if (!attempt.isCompleted()) {
            throw new ResourceNotFoundException("Attempt results", "id", attemptId);
        }

        return buildAttemptResult(attempt, quiz);
    }

    private Quiz findPublishedQuiz(UUID quizId) {
        Quiz quiz = quizRepository.findWithDetailsById(quizId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));

        if (!quiz.isPublished()) {
            throw new QuizNotPublishedException();
        }

        // Check scheduling availability
        if (!quiz.isCurrentlyAvailable()) {
            throw new QuizNotAvailableException(
                quiz.getAvailableFrom(),
                quiz.getAvailableUntil()
            );
        }

        return quiz;
    }

    private void checkAttemptLimits(Quiz quiz, UUID userId, String ipAddress, StartAttemptRequest request) {
        Integer maxAttempts = quiz.getMaxAttempts();
        if (maxAttempts == null) {
            return; // No limit
        }

        long attemptCount;

        if (userId != null) {
            // Authenticated user
            attemptCount = attemptRepository.countByQuizIdAndUserId(quiz.getId(), userId);
        } else if (request.anonymousEmail() != null && !request.anonymousEmail().isBlank()) {
            // Anonymous with email - more restrictive
            attemptCount = attemptRepository.countByQuizIdAndAnonymousEmail(quiz.getId(), request.anonymousEmail());
        } else {
            // Anonymous by IP only
            attemptCount = attemptRepository.countByQuizIdAndIpAddress(quiz.getId(), ipAddress);
            // Also enforce anonymous limit
            if (attemptCount >= ANONYMOUS_ATTEMPT_LIMIT) {
                throw new AttemptLimitExceededException(ANONYMOUS_ATTEMPT_LIMIT);
            }
        }

        if (attemptCount >= maxAttempts) {
            throw new AttemptLimitExceededException(maxAttempts);
        }
    }

    private QuizAttempt findInProgressAttempt(UUID quizId, UUID userId, String ipAddress, String sessionId) {
        if (userId != null) {
            return attemptRepository.findByQuizIdAndUserIdAndCompletedAtIsNull(quizId, userId).orElse(null);
        } else if (sessionId != null && !sessionId.isBlank()) {
            // Prefer session-based tracking for anonymous users
            return attemptRepository.findByQuizIdAndAnonymousSessionIdAndCompletedAtIsNull(quizId, sessionId).orElse(null);
        } else {
            // Fallback to IP-based tracking (legacy behavior)
            return attemptRepository.findByQuizIdAndIpAddressAndCompletedAtIsNull(quizId, ipAddress).orElse(null);
        }
    }

    private QuizAttempt findAttempt(UUID attemptId, UUID quizId, UUID userId, String ipAddress, String sessionId) {
        QuizAttempt attempt = attemptRepository.findByIdAndQuizId(attemptId, quizId)
            .orElseThrow(() -> new ResourceNotFoundException("Attempt", "id", attemptId));

        // Verify ownership
        if (userId != null) {
            if (attempt.getUser() == null || !attempt.getUser().getId().equals(userId)) {
                throw new ResourceNotFoundException("Attempt", "id", attemptId);
            }
        } else {
            // For anonymous users, prefer session-based verification
            String attemptSessionId = attempt.getAnonymousSessionId();
            if (attemptSessionId != null && !attemptSessionId.isBlank()) {
                // Attempt has session ID - verify against provided session
                if (!attemptSessionId.equals(sessionId)) {
                    throw new ResourceNotFoundException("Attempt", "id", attemptId);
                }
            } else {
                // Fallback to IP-based verification (legacy attempts without session)
                if (attempt.getIpAddress() == null || !attempt.getIpAddress().equals(ipAddress)) {
                    throw new ResourceNotFoundException("Attempt", "id", attemptId);
                }
            }
        }

        return attempt;
    }

    private AttemptResultResponse buildAttemptResult(QuizAttempt attempt, Quiz quiz) {
        // Check if results should be visible based on scheduling
        if (!quiz.areResultsVisible()) {
            // Return a pending response without detailed answer info
            return AttemptResultResponse.fromPending(attempt, quiz);
        }

        List<QuizAnswer> answers = answerRepository.findByAttemptIdOrderByAnsweredAtAsc(attempt.getId());

        // Get only the questions that have answers (instead of loading ALL quiz questions)
        Set<UUID> answeredQuestionIds = answers.stream()
            .map(a -> a.getQuestion().getId())
            .collect(Collectors.toSet());
        Map<UUID, Question> questionMap = questionRepository.findByIdIn(answeredQuestionIds).stream()
            .collect(Collectors.toMap(Question::getId, Function.identity()));

        List<AnswerResultResponse> answerResults = new ArrayList<>();

        for (QuizAnswer answer : answers) {
            Question question = questionMap.get(answer.getQuestion().getId());
            if (question == null) continue;

            // Get correct answer info only if showCorrectAnswers is enabled
            Map<String, Object> correctAnswer = null;
            String explanation = null;
            List<AnswerResultResponse.BlankResult> blankResults = null;

            if (quiz.isShowCorrectAnswers()) {
                ScoringService.ScoringResult result = scoringService.scoreAnswer(question, answer.getAnswerData());
                correctAnswer = result.correctAnswer();
                explanation = question.getExplanation();
                blankResults = result.blankResults();
            }

            answerResults.add(new AnswerResultResponse(
                question.getId(),
                question.getText(),
                question.getType(),
                question.getPoints(),
                answer.getAnswerData(),
                answer.getIsCorrect(),
                answer.getPointsEarned(),
                correctAnswer,
                explanation,
                blankResults
            ));
        }

        return AttemptResultResponse.from(attempt, answerResults, quiz);
    }

    /**
     * Validate IP address against quiz's allowed IP list.
     * Throws IpNotAllowedException if IP is not in allowed list.
     */
    private void validateIpAddress(Quiz quiz, String clientIp) {
        if (!quiz.isFilterIpAddresses()) {
            return; // IP filtering not enabled
        }

        if (!quiz.isIpAllowed(clientIp)) {
            throw new IpNotAllowedException(clientIp);
        }
    }

    /**
     * Validate access code against quiz's stored hash.
     * Throws InvalidAccessCodeException if code is missing or incorrect.
     */
    private void validateAccessCode(Quiz quiz, String providedCode) {
        if (!quiz.isRequireAccessCode()) {
            return; // Access code not required
        }

        if (providedCode == null || providedCode.isBlank()) {
            throw new InvalidAccessCodeException("Access code is required for this quiz");
        }

        // Guard against null hash in database (shouldn't happen but defensive)
        if (quiz.getAccessCode() == null) {
            throw new InvalidAccessCodeException();
        }

        // Compare provided code against stored hash using BCrypt
        if (!passwordEncoder.matches(providedCode.trim(), quiz.getAccessCode())) {
            throw new InvalidAccessCodeException();
        }
    }
}
