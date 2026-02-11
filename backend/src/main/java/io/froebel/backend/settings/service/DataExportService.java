package io.froebel.backend.settings.service;

import tools.jackson.databind.ObjectMapper;
import io.froebel.backend.config.AppProperties;
import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.DataExportRequest;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.enums.ExportStatus;
import io.froebel.backend.repository.CourseRepository;
import io.froebel.backend.repository.DataExportRequestRepository;
import io.froebel.backend.repository.QuizRepository;
import io.froebel.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class DataExportService {

    private static final Logger log = LoggerFactory.getLogger(DataExportService.class);

    private final DataExportRequestRepository exportRequestRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;
    private final NotificationPreferenceService notificationPreferenceService;
    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;

    public DataExportService(
        DataExportRequestRepository exportRequestRepository,
        UserRepository userRepository,
        QuizRepository quizRepository,
        CourseRepository courseRepository,
        NotificationPreferenceService notificationPreferenceService,
        AppProperties appProperties,
        ObjectMapper objectMapper
    ) {
        this.exportRequestRepository = exportRequestRepository;
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.courseRepository = courseRepository;
        this.notificationPreferenceService = notificationPreferenceService;
        this.appProperties = appProperties;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public DataExportRequest requestExport(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check rate limit (max 1 per day)
        Instant since = Instant.now().minus(24, ChronoUnit.HOURS);
        long recentCount = exportRequestRepository.countByUserIdAndRequestedAtAfter(userId, since);

        int maxPerDay = appProperties.getSettings().getDataExport().getMaxPerDay();
        if (recentCount >= maxPerDay) {
            throw new IllegalStateException("Maximum " + maxPerDay + " export(s) per day. Please try again later.");
        }

        DataExportRequest request = DataExportRequest.builder()
            .user(user)
            .status(ExportStatus.PENDING)
            .requestedAt(Instant.now())
            .build();

        request = exportRequestRepository.save(request);

        log.info("Data export requested for user {} ({})", userId, user.getEmail());

        // Trigger async processing
        processExportAsync(request.getId());

        return request;
    }

    @Async
    @Transactional
    public void processExportAsync(UUID exportId) {
        DataExportRequest request = exportRequestRepository.findById(exportId)
            .orElseThrow(() -> new ResourceNotFoundException("DataExportRequest", "id", exportId));

        try {
            processExport(request);
        } catch (Exception e) {
            log.error("Failed to process data export {}: {}", exportId, e.getMessage(), e);
            request.setStatus(ExportStatus.FAILED);
            request.setErrorMessage(e.getMessage());
            exportRequestRepository.save(request);
        }
    }

    private void processExport(DataExportRequest request) throws IOException {
        UUID userId = request.getUser().getId();

        log.info("Processing data export for user {}", userId);

        request.setStatus(ExportStatus.PROCESSING);
        exportRequestRepository.save(request);

        // Ensure storage directory exists
        Path storagePath = Path.of(appProperties.getSettings().getDataExport().getStoragePath());
        Files.createDirectories(storagePath);

        // Create export file
        String filename = "froebel-export-" + userId + "-" + System.currentTimeMillis() + ".zip";
        Path filePath = storagePath.resolve(filename);

        try (FileOutputStream fos = new FileOutputStream(filePath.toFile());
             ZipOutputStream zos = new ZipOutputStream(fos)) {

            // Export user profile
            Map<String, Object> profile = exportUserProfile(userId);
            addJsonEntry(zos, "profile.json", profile);

            // Export quizzes
            List<?> quizzes = quizRepository.findByCreatorId(userId);
            addJsonEntry(zos, "quizzes.json", quizzes);

            // Export courses
            List<?> courses = courseRepository.findByCreatorId(userId);
            addJsonEntry(zos, "courses.json", courses);

            // Export notification preferences
            var preferences = notificationPreferenceService.getPreferences(userId);
            addJsonEntry(zos, "notification_preferences.json", preferences);

            // Add metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("exportedAt", Instant.now().toString());
            metadata.put("userId", userId.toString());
            metadata.put("format", "JSON");
            metadata.put("version", "1.0");
            addJsonEntry(zos, "metadata.json", metadata);
        }

        // Update request with file info
        File file = filePath.toFile();
        int expiryDays = appProperties.getSettings().getDataExport().getExpiryDays();

        request.setStatus(ExportStatus.COMPLETED);
        request.setFilePath(filePath.toString());
        request.setFileSizeBytes(file.length());
        request.setCompletedAt(Instant.now());
        request.setExpiresAt(Instant.now().plus(expiryDays, ChronoUnit.DAYS));
        exportRequestRepository.save(request);

        log.info("Data export completed for user {}: {} bytes", userId, file.length());
    }

    private Map<String, Object> exportUserProfile(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Map.of();
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId().toString());
        profile.put("email", user.getEmail());
        profile.put("displayName", user.getDisplayName());
        profile.put("avatarUrl", user.getAvatarUrl());
        profile.put("bio", user.getBio());
        profile.put("role", user.getRole().name());
        profile.put("emailVerified", user.isEmailVerified());
        profile.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return profile;
    }

    private void addJsonEntry(ZipOutputStream zos, String entryName, Object data) throws IOException {
        zos.putNextEntry(new ZipEntry(entryName));
        byte[] jsonBytes = objectMapper.writeValueAsBytes(data);
        zos.write(jsonBytes);
        zos.closeEntry();
    }

    public Optional<DataExportRequest> getExportStatus(UUID userId, UUID exportId) {
        return exportRequestRepository.findByIdAndUserId(exportId, userId);
    }

    public List<DataExportRequest> getUserExports(UUID userId) {
        return exportRequestRepository.findByUserIdOrderByRequestedAtDesc(userId);
    }

    public Resource downloadExport(UUID userId, UUID exportId) {
        DataExportRequest request = exportRequestRepository.findByIdAndUserId(exportId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("DataExportRequest", "id", exportId));

        if (request.getStatus() != ExportStatus.COMPLETED) {
            throw new IllegalStateException("Export is not ready for download");
        }

        if (request.getExpiresAt() != null && request.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalStateException("Export has expired");
        }

        File file = new File(request.getFilePath());
        if (!file.exists()) {
            throw new ResourceNotFoundException("Export file", "path", request.getFilePath());
        }

        return new FileSystemResource(file);
    }

    @Scheduled(cron = "0 0 3 * * *") // Run daily at 3 AM
    @Transactional
    public void cleanupExpiredExports() {
        log.info("Starting cleanup of expired data exports");

        List<DataExportRequest> expired = exportRequestRepository
            .findByStatusAndExpiresAtBefore(ExportStatus.COMPLETED, Instant.now());

        for (DataExportRequest request : expired) {
            try {
                // Delete the file
                if (request.getFilePath() != null) {
                    Files.deleteIfExists(Path.of(request.getFilePath()));
                }

                // Update status
                request.setStatus(ExportStatus.EXPIRED);
                exportRequestRepository.save(request);

                log.debug("Cleaned up expired export: {}", request.getId());
            } catch (Exception e) {
                log.error("Failed to cleanup export {}: {}", request.getId(), e.getMessage());
            }
        }

        log.info("Completed cleanup of {} expired exports", expired.size());
    }
}
