package io.froebel.backend.settings.service;

import io.froebel.backend.config.AppProperties;
import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.AccountDeletionRequest;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.enums.DeletionStatus;
import io.froebel.backend.repository.AccountDeletionRequestRepository;
import io.froebel.backend.repository.CourseRepository;
import io.froebel.backend.repository.QuizRepository;
import io.froebel.backend.repository.UserRepository;
import io.froebel.backend.settings.dto.AccountDeletionStatusResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AccountDeletionService {

    private static final Logger log = LoggerFactory.getLogger(AccountDeletionService.class);

    private final AccountDeletionRequestRepository deletionRequestRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;
    private final AppProperties appProperties;
    private final SessionManagementService sessionManagementService;

    public AccountDeletionService(
        AccountDeletionRequestRepository deletionRequestRepository,
        UserRepository userRepository,
        QuizRepository quizRepository,
        CourseRepository courseRepository,
        AppProperties appProperties,
        SessionManagementService sessionManagementService
    ) {
        this.deletionRequestRepository = deletionRequestRepository;
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.courseRepository = courseRepository;
        this.appProperties = appProperties;
        this.sessionManagementService = sessionManagementService;
    }

    @Transactional
    public AccountDeletionStatusResponse requestDeletion(UUID userId, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if there's already a pending deletion request
        Optional<AccountDeletionRequest> existing = deletionRequestRepository
            .findByUserIdAndStatus(userId, DeletionStatus.PENDING);

        if (existing.isPresent()) {
            return AccountDeletionStatusResponse.from(existing.get());
        }

        // Calculate scheduled deletion date
        int gracePeriodDays = appProperties.getSettings().getAccountDeletion().getGracePeriodDays();
        Instant scheduledDeletion = Instant.now().plus(gracePeriodDays, ChronoUnit.DAYS);

        AccountDeletionRequest request = AccountDeletionRequest.builder()
            .user(user)
            .reason(reason)
            .status(DeletionStatus.PENDING)
            .requestedAt(Instant.now())
            .scheduledDeletion(scheduledDeletion)
            .build();

        request = deletionRequestRepository.save(request);

        log.info("Account deletion requested for user {} ({}), scheduled for {}",
            userId, user.getEmail(), scheduledDeletion);

        return AccountDeletionStatusResponse.from(request);
    }

    @Transactional
    public void cancelDeletion(UUID userId) {
        AccountDeletionRequest request = deletionRequestRepository
            .findByUserIdAndStatus(userId, DeletionStatus.PENDING)
            .orElseThrow(() -> new IllegalStateException("No pending deletion request found"));

        request.setStatus(DeletionStatus.CANCELLED);
        request.setCancelledAt(Instant.now());
        deletionRequestRepository.save(request);

        log.info("Account deletion cancelled for user {}", userId);
    }

    public Optional<AccountDeletionStatusResponse> getDeletionStatus(UUID userId) {
        return deletionRequestRepository
            .findByUserIdAndStatus(userId, DeletionStatus.PENDING)
            .map(AccountDeletionStatusResponse::from);
    }

    @Scheduled(cron = "0 0 2 * * *") // Run daily at 2 AM
    @Transactional
    public void processScheduledDeletions() {
        log.info("Starting scheduled account deletion processing");

        List<AccountDeletionRequest> requests = deletionRequestRepository
            .findByStatusAndScheduledDeletionBefore(DeletionStatus.PENDING, Instant.now());

        log.info("Found {} accounts scheduled for deletion", requests.size());

        for (AccountDeletionRequest request : requests) {
            try {
                processAccountDeletion(request);
            } catch (Exception e) {
                log.error("Failed to process account deletion for user {}: {}",
                    request.getUser().getId(), e.getMessage(), e);
            }
        }

        log.info("Completed scheduled account deletion processing");
    }

    @Transactional
    public void processAccountDeletion(AccountDeletionRequest request) {
        User user = request.getUser();
        UUID userId = user.getId();

        log.info("Processing account deletion for user {} ({})", userId, user.getEmail());

        // 1. Anonymize quizzes - set creator to null but keep the quizzes
        int quizzesAnonymized = quizRepository.anonymizeByCreatorId(userId);
        log.debug("Anonymized {} quizzes for user {}", quizzesAnonymized, userId);

        // 2. Anonymize courses - set creator to null but keep the courses
        int coursesAnonymized = courseRepository.anonymizeByCreatorId(userId);
        log.debug("Anonymized {} courses for user {}", coursesAnonymized, userId);

        // 3. Revoke all sessions
        sessionManagementService.revokeAllSessions(userId);

        // 4. Delete the user (cascades to linked accounts, notification preferences, etc.)
        userRepository.delete(user);

        // 5. Mark deletion request as processed
        request.setStatus(DeletionStatus.PROCESSED);
        request.setProcessedAt(Instant.now());
        deletionRequestRepository.save(request);

        log.info("Account deletion completed for user {} - {} quizzes and {} courses anonymized",
            userId, quizzesAnonymized, coursesAnonymized);
    }
}
