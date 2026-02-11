package io.froebel.backend.quiz.service;

import io.froebel.backend.exception.InvalidRequestException;
import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.Question;
import io.froebel.backend.model.entity.Quiz;
import io.froebel.backend.model.entity.QuizHistory;
import io.froebel.backend.model.entity.Tag;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.enums.QuizStatus;
import io.froebel.backend.quiz.dto.QuizSnapshot;
import io.froebel.backend.quiz.dto.request.CreateQuizRequest;
import io.froebel.backend.quiz.dto.request.UpdateQuizRequest;
import io.froebel.backend.quiz.dto.response.QuizDetailResponse;
import io.froebel.backend.quiz.dto.response.QuizResponse;
import io.froebel.backend.quiz.dto.response.QuizSummaryResponse;
import io.froebel.backend.quiz.exception.QuizAccessDeniedException;
import io.froebel.backend.quiz.exception.QuizConflictException;
import io.froebel.backend.quiz.util.ShareableIdGenerator;
import io.froebel.backend.repository.CategoryRepository;
import io.froebel.backend.repository.CourseRepository;
import io.froebel.backend.repository.QuizHistoryRepository;
import io.froebel.backend.repository.QuizRepository;
import io.froebel.backend.repository.TagRepository;
import io.froebel.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private static final int MAX_SHAREABLE_ID_ATTEMPTS = 10;

    private final QuizRepository quizRepository;
    private final QuizHistoryRepository quizHistoryRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final PasswordEncoder passwordEncoder;

    public QuizService(
        QuizRepository quizRepository,
        QuizHistoryRepository quizHistoryRepository,
        UserRepository userRepository,
        CourseRepository courseRepository,
        CategoryRepository categoryRepository,
        TagRepository tagRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.quizRepository = quizRepository;
        this.quizHistoryRepository = quizHistoryRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public QuizDetailResponse createQuiz(UUID userId, CreateQuizRequest request) {
        // Validate scheduling window
        if (request.availableFrom() != null && request.availableUntil() != null
            && !request.availableFrom().isBefore(request.availableUntil())) {
            throw new InvalidRequestException("availableFrom must be before availableUntil");
        }

        // Validate access code is set when required
        if (request.requireAccessCode() && (request.accessCode() == null || request.accessCode().isBlank())) {
            throw new InvalidRequestException("Access code is required when 'Require Access Code' is enabled");
        }

        // Hash access code if provided
        String hashedAccessCode = null;
        String plaintextAccessCode = request.accessCode();
        if (plaintextAccessCode != null && !plaintextAccessCode.isBlank()) {
            hashedAccessCode = passwordEncoder.encode(plaintextAccessCode);
        }

        User creator = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Quiz quiz = Quiz.builder()
            .title(request.title())
            .shareableId(generateUniqueShareableId())
            .description(request.description())
            .iconUrl(request.iconUrl())
            .bannerUrl(request.bannerUrl())
            .creator(creator)
            .isPublic(request.isPublic())
            .allowAnonymous(request.allowAnonymous())
            .timeLimit(request.timeLimit())
            .passingScore(request.passingScore())
            .shuffleQuestions(request.shuffleQuestions())
            .shuffleChoices(request.shuffleChoices())
            .showCorrectAnswers(request.showCorrectAnswers())
            .maxAttempts(request.maxAttempts())
            .aiGradingEnabled(request.aiGradingEnabled())
            .availableFrom(request.availableFrom())
            .availableUntil(request.availableUntil())
            .resultsVisibleFrom(request.resultsVisibleFrom())
            .requireAccessCode(request.requireAccessCode())
            .accessCode(hashedAccessCode)
            .filterIpAddresses(request.filterIpAddresses())
            .allowedIpAddresses(request.allowedIpAddresses())
            .status(QuizStatus.DRAFT)
            .build();

        // Set course if provided (must be owned by user)
        if (request.courseId() != null) {
            quiz.setCourse(courseRepository.findByIdAndCreatorId(request.courseId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found or not owned by you")));
        }

        // Set category if provided
        if (request.categoryId() != null) {
            quiz.setCategory(categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId())));
        }

        // Handle tags
        if (request.tagNames() != null && !request.tagNames().isEmpty()) {
            Set<Tag> tags = getOrCreateTags(request.tagNames());
            quiz.setTags(tags);
        }

        quiz = quizRepository.save(quiz);
        // Return QuizDetailResponse for full data including empty questions list
        return QuizDetailResponse.from(quiz, false);
    }

    public Page<QuizSummaryResponse> getUserQuizzes(UUID userId, Pageable pageable) {
        return quizRepository.findByCreatorId(userId, pageable)
            .map(QuizSummaryResponse::from);
    }

    public QuizDetailResponse getQuizDetail(UUID quizId, UUID userId) {
        Quiz quiz = findQuizById(quizId);

        boolean isOwner = quiz.getCreator().getId().equals(userId);

        // Check access: owner or published+public
        if (!isOwner && !(quiz.isPublished() && quiz.isPublic())) {
            throw new QuizAccessDeniedException(quizId.toString(), userId.toString());
        }

        // Only expose sensitive fields to owner
        return QuizDetailResponse.from(quiz, false, isOwner);
    }

    public QuizDetailResponse getOwnedQuizDetail(UUID quizId, UUID userId) {
        Quiz quiz = findOwnedQuiz(quizId, userId);
        return QuizDetailResponse.from(quiz);
    }

    @Transactional
    public QuizDetailResponse updateQuiz(UUID quizId, UUID userId, UpdateQuizRequest request) {
        Quiz quiz = findOwnedQuiz(quizId, userId);
        return updateQuizInternal(quiz, userId, request);
    }

    @Transactional
    public QuizResponse setQuizStatus(UUID quizId, UUID userId, QuizStatus status) {
        Quiz quiz = findOwnedQuiz(quizId, userId);
        quiz.setStatus(status);
        quiz = quizRepository.saveAndFlush(quiz);
        return QuizResponse.from(quiz);
    }

    @Transactional
    public QuizResponse publishQuiz(UUID quizId, UUID userId, boolean publish) {
        Quiz quiz = findOwnedQuiz(quizId, userId);

        if (publish) {
            if (quiz.getQuestions().isEmpty()) {
                throw new InvalidRequestException("Cannot publish quiz with no questions");
            }

            // Create published snapshot and set version pointer
            Integer versionNumber = createPublishSnapshot(quiz, userId);
            quiz.setPublishedVersionNumber(versionNumber);
            quiz.setStatus(QuizStatus.PUBLISHED);
        } else {
            // Unpublish - keep version reference for historical attempts
            quiz.setStatus(QuizStatus.DRAFT);
        }

        quiz = quizRepository.saveAndFlush(quiz);
        return QuizResponse.from(quiz);
    }

    @Transactional
    public void deleteQuiz(UUID quizId, UUID userId) {
        Quiz quiz = findOwnedQuiz(quizId, userId);
        quizRepository.delete(quiz);
    }

    public Page<QuizSummaryResponse> getPublicQuizzes(Pageable pageable) {
        Page<Quiz> quizPage = quizRepository.findByStatusAndIsPublicTrue(QuizStatus.PUBLISHED, pageable);
        return mapQuizzesWithSnapshots(quizPage);
    }

    public Page<QuizSummaryResponse> getFilteredPublicQuizzes(
        String search,
        UUID categoryId,
        Set<String> tags,
        String sortBy,
        Pageable pageable) {
        // Build sort from sortBy parameter
        Sort sort = buildSort(sortBy);
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            sort
        );

        // Convert tags to slugs (tags are stored as slugs)
        Set<String> tagSlugs = tags != null && !tags.isEmpty() ? tags : null;

        Page<Quiz> quizPage = quizRepository.searchPublicQuizzesWithFilters(
            QuizStatus.PUBLISHED,
            search,
            categoryId,
            tagSlugs,
            sortedPageable
        );

        return mapQuizzesWithSnapshots(quizPage);
    }

    /**
     * Map quizzes to summary responses using published snapshots when available.
     * Falls back to live entity data for legacy quizzes without snapshots.
     */
    private Page<QuizSummaryResponse> mapQuizzesWithSnapshots(Page<Quiz> quizPage) {
        // Collect quiz IDs that have published versions
        Set<UUID> quizIdsWithPublishedVersion = quizPage.getContent().stream()
            .filter(q -> q.getPublishedVersionNumber() != null)
            .map(Quiz::getId)
            .collect(Collectors.toSet());

        // Batch fetch published snapshots
        Map<UUID, QuizSnapshot> snapshotMap = Collections.emptyMap();
        if (!quizIdsWithPublishedVersion.isEmpty()) {
            snapshotMap = quizHistoryRepository
                .findPublishedSnapshotsByQuizIds(quizIdsWithPublishedVersion)
                .stream()
                .collect(Collectors.toMap(h -> h.getQuiz().getId(), QuizHistory::getSnapshot));
        }

        // Map with snapshot when available, fallback to live entity
        Map<UUID, QuizSnapshot> finalSnapshotMap = snapshotMap;
        return quizPage.map(quiz -> {
            QuizSnapshot snapshot = finalSnapshotMap.get(quiz.getId());
            if (snapshot != null) {
                return QuizSummaryResponse.fromSnapshot(quiz, snapshot);
            }
            return QuizSummaryResponse.from(quiz);  // Legacy fallback
        });
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sortBy) {
            case "popular" -> Sort.by(Sort.Direction.DESC, "createdAt"); // TODO: add attemptCount field
            case "updated" -> Sort.by(Sort.Direction.DESC, "updatedAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt"); // "newest"
        };
    }

    public Quiz findQuizById(UUID quizId) {
        return quizRepository.findWithDetailsById(quizId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));
    }

    public Quiz findOwnedQuiz(UUID quizId, UUID userId) {
        return quizRepository.findWithDetailsByIdAndCreatorId(quizId, userId)
            .orElseThrow(() -> new QuizAccessDeniedException(quizId.toString(), userId.toString()));
    }

    /**
     * Generate a URL-safe slug from a tag name.
     * Handles special characters, multiple spaces, and non-ASCII characters.
     */
    private String generateSlug(String name) {
        if (name == null || name.isBlank()) {
            return "";
        }
        return name
            .toLowerCase()
            .trim()
            // Replace accented characters with ASCII equivalents
            .replaceAll("[àáâãäå]", "a")
            .replaceAll("[èéêë]", "e")
            .replaceAll("[ìíîï]", "i")
            .replaceAll("[òóôõö]", "o")
            .replaceAll("[ùúûü]", "u")
            .replaceAll("[ç]", "c")
            .replaceAll("[ñ]", "n")
            // Replace any non-alphanumeric characters with hyphens
            .replaceAll("[^a-z0-9]+", "-")
            // Remove leading/trailing hyphens
            .replaceAll("^-+|-+$", "");
    }

    private Set<Tag> getOrCreateTags(Set<String> tagNames) {
        // Normalize all tag names first
        Set<String> normalizedNames = tagNames.stream()
            .map(name -> name.trim().toLowerCase())
            .filter(name -> !name.isEmpty())
            .collect(Collectors.toSet());

        if (normalizedNames.isEmpty()) {
            return new HashSet<>();
        }

        // Batch lookup existing tags (single query instead of N queries)
        Set<Tag> existingTags = tagRepository.findByNameIn(normalizedNames);
        Set<String> existingNames = existingTags.stream()
            .map(Tag::getName)
            .collect(Collectors.toSet());

        // Create missing tags
        Set<Tag> newTags = normalizedNames.stream()
            .filter(name -> !existingNames.contains(name))
            .map(name -> Tag.builder()
                .name(name)
                .slug(generateSlug(name))
                .build())
            .collect(Collectors.toSet());

        // Batch save new tags with race condition handling
        if (!newTags.isEmpty()) {
            try {
                tagRepository.saveAll(newTags);
            } catch (DataIntegrityViolationException e) {
                // Race condition: another transaction created the same tag(s)
                // Re-fetch all tags to get the ones created by the other transaction
                return tagRepository.findByNameIn(normalizedNames);
            }
        }

        // Combine existing and new tags
        Set<Tag> allTags = new HashSet<>(existingTags);
        allTags.addAll(newTags);
        return allTags;
    }

    /**
     * Generate a unique shareable ID with collision retry.
     */
    private String generateUniqueShareableId() {
        for (int i = 0; i < MAX_SHAREABLE_ID_ATTEMPTS; i++) {
            String id = ShareableIdGenerator.generate();
            if (!quizRepository.existsByShareableId(id)) {
                return id;
            }
        }
        throw new IllegalStateException("Failed to generate unique shareable ID after "
            + MAX_SHAREABLE_ID_ATTEMPTS + " attempts");
    }

    // ==================== Shareable ID Lookup Methods ====================

    public Quiz findQuizByShareableId(String shareableId) {
        return quizRepository.findWithDetailsByShareableId(shareableId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz", "shareableId", shareableId));
    }

    public Quiz findOwnedQuizByShareableId(String shareableId, UUID userId) {
        return quizRepository.findWithDetailsByShareableIdAndCreatorId(shareableId, userId)
            .orElseThrow(() -> new QuizAccessDeniedException(shareableId, userId.toString()));
    }

    public QuizDetailResponse getQuizDetailByShareableId(String shareableId, UUID userId) {
        Quiz quiz = findQuizByShareableId(shareableId);

        boolean isOwner = quiz.getCreator().getId().equals(userId);

        // Check access: owner or published+public
        if (!isOwner && !(quiz.isPublished() && quiz.isPublic())) {
            throw new QuizAccessDeniedException(shareableId, userId.toString());
        }

        // Only expose sensitive fields to owner
        return QuizDetailResponse.from(quiz, false, isOwner);
    }

    public QuizDetailResponse getOwnedQuizDetailByShareableId(String shareableId, UUID userId) {
        Quiz quiz = findOwnedQuizByShareableId(shareableId, userId);
        boolean hasChanges = hasUnpublishedChangesInternal(quiz);
        return QuizDetailResponse.from(quiz, hasChanges);
    }

    @Transactional
    public QuizDetailResponse updateQuizByShareableId(String shareableId, UUID userId, UpdateQuizRequest request) {
        Quiz quiz = findOwnedQuizByShareableId(shareableId, userId);
        return updateQuizInternal(quiz, userId, request);
    }

    @Transactional
    public QuizDetailResponse publishQuizByShareableId(String shareableId, UUID userId, boolean publish) {
        Quiz quiz = findOwnedQuizByShareableId(shareableId, userId);

        if (publish) {
            if (quiz.getQuestions().isEmpty()) {
                throw new InvalidRequestException("Cannot publish quiz with no questions");
            }

            // Create published snapshot and set version pointer
            Integer versionNumber = createPublishSnapshot(quiz, userId);
            quiz.setPublishedVersionNumber(versionNumber);
            quiz.setStatus(QuizStatus.PUBLISHED);
        } else {
            // Unpublish - keep version reference for historical attempts
            quiz.setStatus(QuizStatus.DRAFT);
        }

        quiz = quizRepository.saveAndFlush(quiz);
        // After publishing, hasUnpublishedChanges is false (fresh snapshot)
        // After unpublishing, compute it normally
        boolean hasChanges = !publish && hasUnpublishedChangesInternal(quiz);
        return QuizDetailResponse.from(quiz, hasChanges);
    }

    @Transactional
    public void deleteQuizByShareableId(String shareableId, UUID userId) {
        Quiz quiz = findOwnedQuizByShareableId(shareableId, userId);
        quizRepository.delete(quiz);
    }

    /**
     * Internal update logic shared by both UUID and shareable ID update methods.
     * Returns QuizDetailResponse with computed hasUnpublishedChanges.
     */
    private QuizDetailResponse updateQuizInternal(Quiz quiz, UUID userId, UpdateQuizRequest request) {
        // Validate scheduling window
        if (request.availableFrom() != null && request.availableUntil() != null
            && !request.availableFrom().isBefore(request.availableUntil())) {
            throw new InvalidRequestException("availableFrom must be before availableUntil");
        }

        // Validate optimistic lock version before making changes
        if (request.version() != null && !request.version().equals(quiz.getVersion())) {
            throw new QuizConflictException(quiz.getVersion());
        }

        // Save current state to history before applying changes
        saveQuizHistory(quiz, userId);

        quiz.setTitle(request.title());
        quiz.setDescription(request.description());
        quiz.setIconUrl(request.iconUrl());
        quiz.setBannerUrl(request.bannerUrl());

        if (request.isPublic() != null) {
            quiz.setPublic(request.isPublic());
        }
        if (request.allowAnonymous() != null) {
            quiz.setAllowAnonymous(request.allowAnonymous());
        }
        if (request.shuffleQuestions() != null) {
            quiz.setShuffleQuestions(request.shuffleQuestions());
        }
        if (request.shuffleChoices() != null) {
            quiz.setShuffleChoices(request.shuffleChoices());
        }
        if (request.showCorrectAnswers() != null) {
            quiz.setShowCorrectAnswers(request.showCorrectAnswers());
        }
        if (request.aiGradingEnabled() != null) {
            quiz.setAiGradingEnabled(request.aiGradingEnabled());
        }

        quiz.setTimeLimit(request.timeLimit());
        quiz.setPassingScore(request.passingScore());
        quiz.setMaxAttempts(request.maxAttempts());

        // Update scheduling fields
        quiz.setAvailableFrom(request.availableFrom());
        quiz.setAvailableUntil(request.availableUntil());
        quiz.setResultsVisibleFrom(request.resultsVisibleFrom());

        // Update access restriction fields
        if (request.requireAccessCode() != null) {
            quiz.setRequireAccessCode(request.requireAccessCode());
        }
        // Hash access code if a new one is provided
        if (request.accessCode() != null) {
            if (request.accessCode().isBlank()) {
                // Clear access code
                quiz.setAccessCode(null);
            } else {
                // Hash the new access code
                quiz.setAccessCode(passwordEncoder.encode(request.accessCode()));
            }
        }
        if (request.filterIpAddresses() != null) {
            quiz.setFilterIpAddresses(request.filterIpAddresses());
        }
        if (request.allowedIpAddresses() != null) {
            quiz.setAllowedIpAddresses(request.allowedIpAddresses());
        }

        // Validate access code hash exists when required
        if (quiz.isRequireAccessCode() && (quiz.getAccessCode() == null || quiz.getAccessCode().isBlank())) {
            throw new InvalidRequestException("Access code is required when 'Require Access Code' is enabled");
        }

        // Update course (must be owned by user)
        if (request.courseId() != null) {
            quiz.setCourse(courseRepository.findByIdAndCreatorId(request.courseId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found or not owned by you")));
        } else {
            quiz.setCourse(null);
        }

        // Update category
        if (request.categoryId() != null) {
            quiz.setCategory(categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId())));
        } else {
            quiz.setCategory(null);
        }

        // Update tags
        if (request.tagNames() != null) {
            Set<Tag> tags = getOrCreateTags(request.tagNames());
            quiz.setTags(tags);
        }

        try {
            // Use saveAndFlush to ensure @Version is updated before returning response
            quiz = quizRepository.saveAndFlush(quiz);
        } catch (OptimisticLockingFailureException ex) {
            Quiz current = quizRepository.findByShareableId(quiz.getShareableId()).orElseThrow();
            throw new QuizConflictException(current.getVersion());
        }

        // Compute hasUnpublishedChanges after saving
        boolean hasChanges = hasUnpublishedChangesInternal(quiz);
        return QuizDetailResponse.from(quiz, hasChanges);
    }

    // ==================== Quiz History Methods ====================

    /**
     * Save the current quiz state to history before applying updates.
     */
    private void saveQuizHistory(Quiz quiz, UUID userId) {
        // Determine the next version number
        Integer maxVersion = quizHistoryRepository.findMaxVersionNumberByQuizId(quiz.getId());
        int nextVersion = (maxVersion == null) ? 1 : maxVersion + 1;

        // Get the user who is making the change
        User createdBy = userRepository.findById(userId).orElse(null);

        // Create and save history entry
        QuizHistory history = QuizHistory.builder()
            .quiz(quiz)
            .versionNumber(nextVersion)
            .snapshot(createSnapshot(quiz))
            .createdBy(createdBy)
            .build();

        quizHistoryRepository.save(history);
    }

    /**
     * Create a published snapshot and return the version number.
     * This is separate from saveQuizHistory because publishing creates a new version
     * that represents the live published content, not just a history entry.
     */
    private Integer createPublishSnapshot(Quiz quiz, UUID userId) {
        Integer maxVersion = quizHistoryRepository.findMaxVersionNumberByQuizId(quiz.getId());
        int newVersion = (maxVersion == null) ? 1 : maxVersion + 1;

        User createdBy = userRepository.findById(userId).orElse(null);

        QuizHistory history = QuizHistory.builder()
            .quiz(quiz)
            .versionNumber(newVersion)
            .snapshot(createSnapshot(quiz))
            .createdBy(createdBy)
            .build();

        quizHistoryRepository.save(history);
        return newVersion;
    }

    /**
     * Update the published version with current draft content.
     * Creates a new snapshot and updates the publishedVersionNumber pointer.
     */
    @Transactional
    public QuizResponse updatePublishedVersion(UUID quizId, UUID userId) {
        Quiz quiz = findOwnedQuiz(quizId, userId);

        if (quiz.getStatus() != QuizStatus.PUBLISHED) {
            throw new InvalidRequestException("Quiz must be published first");
        }

        if (quiz.getQuestions().isEmpty()) {
            throw new InvalidRequestException("Cannot publish quiz with no questions");
        }

        // Create new published snapshot
        Integer versionNumber = createPublishSnapshot(quiz, userId);
        quiz.setPublishedVersionNumber(versionNumber);
        quiz = quizRepository.saveAndFlush(quiz);

        return QuizResponse.from(quiz);
    }

    /**
     * Update the published version by shareable ID.
     */
    @Transactional
    public QuizDetailResponse updatePublishedVersionByShareableId(String shareableId, UUID userId) {
        Quiz quiz = findOwnedQuizByShareableId(shareableId, userId);

        if (quiz.getStatus() != QuizStatus.PUBLISHED) {
            throw new InvalidRequestException("Quiz must be published first");
        }

        if (quiz.getQuestions().isEmpty()) {
            throw new InvalidRequestException("Cannot publish quiz with no questions");
        }

        Integer versionNumber = createPublishSnapshot(quiz, userId);
        quiz.setPublishedVersionNumber(versionNumber);
        quiz = quizRepository.saveAndFlush(quiz);

        // After updating published version, hasUnpublishedChanges is false
        return QuizDetailResponse.from(quiz, false);
    }

    /**
     * Check if a quiz has unpublished draft changes.
     * Compares current state against the published snapshot.
     */
    public boolean hasUnpublishedChanges(UUID quizId) {
        Quiz quiz = findQuizById(quizId);
        return hasUnpublishedChangesInternal(quiz);
    }

    /**
     * Check if a quiz has unpublished draft changes by shareable ID.
     */
    public boolean hasUnpublishedChangesByShareableId(String shareableId) {
        Quiz quiz = findQuizByShareableId(shareableId);
        return hasUnpublishedChangesInternal(quiz);
    }

    /**
     * Check if a quiz has unpublished draft changes by shareable ID.
     * Includes authorization check to ensure user owns the quiz.
     */
    public boolean hasUnpublishedChangesByShareableId(String shareableId, UUID userId) {
        Quiz quiz = findOwnedQuizByShareableId(shareableId, userId);
        return hasUnpublishedChangesInternal(quiz);
    }

    private boolean hasUnpublishedChangesInternal(Quiz quiz) {
        if (quiz.getPublishedVersionNumber() == null) {
            return false;
        }

        QuizHistory published = quizHistoryRepository
            .findByQuizIdAndVersionNumber(quiz.getId(), quiz.getPublishedVersionNumber())
            .orElse(null);

        if (published == null) {
            return false;
        }

        // Compare current state with published snapshot
        QuizSnapshot current = createSnapshot(quiz);
        return !snapshotsEqual(current, published.getSnapshot());
    }

    /**
     * Compare two snapshots for equality.
     * Used to detect if draft has changes compared to published version.
     */
    private boolean snapshotsEqual(QuizSnapshot a, QuizSnapshot b) {
        if (a == null || b == null) return a == b;

        // Compare basic fields
        if (!java.util.Objects.equals(a.title(), b.title())) return false;
        if (!java.util.Objects.equals(a.description(), b.description())) return false;
        if (!java.util.Objects.equals(a.iconUrl(), b.iconUrl())) return false;
        if (!java.util.Objects.equals(a.bannerUrl(), b.bannerUrl())) return false;

        // Compare settings
        if (!java.util.Objects.equals(a.settings(), b.settings())) return false;

        // Compare access
        if (!java.util.Objects.equals(a.access(), b.access())) return false;

        // Compare scheduling
        if (!java.util.Objects.equals(a.scheduling(), b.scheduling())) return false;

        // Compare relationships
        if (!java.util.Objects.equals(a.categoryId(), b.categoryId())) return false;
        if (!java.util.Objects.equals(a.courseId(), b.courseId())) return false;
        if (!java.util.Objects.equals(a.tagNames(), b.tagNames())) return false;

        // Compare questions (order matters)
        if (a.questions().size() != b.questions().size()) return false;
        for (int i = 0; i < a.questions().size(); i++) {
            if (!java.util.Objects.equals(a.questions().get(i), b.questions().get(i))) {
                return false;
            }
        }

        return true;
    }

    /**
     * Create a complete snapshot of the quiz state including all questions.
     */
    private QuizSnapshot createSnapshot(Quiz quiz) {
        // Create question snapshots (include ID for answer matching during scoring)
        // Deduplicate by question ID to prevent duplicates caused by Cartesian product
        // when EntityGraph fetches both questions and tags collections via LEFT JOIN FETCH
        Map<UUID, Question> uniqueQuestions = new LinkedHashMap<>();
        for (Question q : quiz.getQuestions()) {
            uniqueQuestions.putIfAbsent(q.getId(), q);
        }

        List<QuizSnapshot.QuestionSnapshot> questionSnapshots = uniqueQuestions.values().stream()
            .map(q -> new QuizSnapshot.QuestionSnapshot(
                q.getId(),
                q.getText(),
                q.getType().name(),
                q.getPoints(),
                q.getQuestionOrder(),
                q.getChapter(),
                q.getExplanation(),
                q.getHintCorrect(),
                q.getHintWrong(),
                q.getIdentifier(),
                q.getData()
            ))
            .collect(Collectors.toList());

        // Create settings snapshot
        QuizSnapshot.Settings settings = new QuizSnapshot.Settings(
            quiz.getTimeLimit(),
            quiz.getPassingScore(),
            quiz.isShuffleQuestions(),
            quiz.isShuffleChoices(),
            quiz.isShowCorrectAnswers(),
            quiz.getMaxAttempts(),
            quiz.isAiGradingEnabled()
        );

        // Normalize IP addresses for clean JSON serialization (replace newlines with commas)
        String normalizedIps = quiz.getAllowedIpAddresses() != null
            ? quiz.getAllowedIpAddresses().replaceAll("[\\r\\n]+", ",").trim()
            : null;

        // Create access snapshot (don't store actual access code hash, just whether it's set)
        boolean hasAccessCode = quiz.getAccessCode() != null && !quiz.getAccessCode().isBlank();
        QuizSnapshot.Access access = new QuizSnapshot.Access(
            quiz.isPublic(),
            quiz.isAllowAnonymous(),
            quiz.isRequireAccessCode(),
            hasAccessCode,
            quiz.isFilterIpAddresses(),
            normalizedIps
        );

        // Create scheduling snapshot
        QuizSnapshot.Scheduling scheduling = new QuizSnapshot.Scheduling(
            quiz.getAvailableFrom(),
            quiz.getAvailableUntil(),
            quiz.getResultsVisibleFrom()
        );

        // Get tag names
        Set<String> tagNames = quiz.getTags().stream()
            .map(Tag::getName)
            .collect(Collectors.toSet());

        return new QuizSnapshot(
            quiz.getTitle(),
            quiz.getDescription(),
            quiz.getIconUrl(),
            quiz.getBannerUrl(),
            settings,
            access,
            scheduling,
            questionSnapshots,
            quiz.getCategory() != null ? quiz.getCategory().getId() : null,
            quiz.getCourse() != null ? quiz.getCourse().getId() : null,
            tagNames
        );
    }
}
