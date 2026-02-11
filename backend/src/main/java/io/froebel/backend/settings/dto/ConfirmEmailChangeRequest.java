package io.froebel.backend.settings.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmEmailChangeRequest(
    @NotBlank(message = "Confirmation token is required")
    String token
) {}
