package io.froebel.backend.settings.dto;

import io.froebel.backend.model.entity.DataExportRequest;
import io.froebel.backend.model.enums.ExportStatus;

import java.time.Instant;
import java.util.UUID;

public record DataExportStatusResponse(
    UUID exportId,
    ExportStatus status,
    Long fileSizeBytes,
    Instant requestedAt,
    Instant completedAt,
    Instant expiresAt,
    String errorMessage,
    String downloadUrl
) {
    public static DataExportStatusResponse from(DataExportRequest request, String downloadUrl) {
        return new DataExportStatusResponse(
            request.getId(),
            request.getStatus(),
            request.getFileSizeBytes(),
            request.getRequestedAt(),
            request.getCompletedAt(),
            request.getExpiresAt(),
            request.getErrorMessage(),
            downloadUrl
        );
    }
}
