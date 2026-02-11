package io.froebel.backend.settings.dto;

import io.froebel.backend.model.enums.DeletionStatus;

import java.time.Instant;
import java.util.UUID;

public record AccountDeletionStatusResponse(
    UUID requestId,
    DeletionStatus status,
    String reason,
    Instant requestedAt,
    Instant scheduledDeletion,
    Instant cancelledAt,
    long daysRemaining
) {
    public static AccountDeletionStatusResponse from(
        io.froebel.backend.model.entity.AccountDeletionRequest request
    ) {
        long daysRemaining = 0;
        if (request.getStatus() == DeletionStatus.PENDING && request.getScheduledDeletion() != null) {
            long millisRemaining = request.getScheduledDeletion().toEpochMilli() - Instant.now().toEpochMilli();
            daysRemaining = Math.max(0, millisRemaining / (24 * 60 * 60 * 1000));
        }

        return new AccountDeletionStatusResponse(
            request.getId(),
            request.getStatus(),
            request.getReason(),
            request.getRequestedAt(),
            request.getScheduledDeletion(),
            request.getCancelledAt(),
            daysRemaining
        );
    }
}
