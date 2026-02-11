package io.froebel.backend.settings.dto;

import jakarta.validation.constraints.Size;

public record AccountDeletionRequest(
    @Size(max = 500, message = "Reason must be 500 characters or less")
    String reason
) {}
