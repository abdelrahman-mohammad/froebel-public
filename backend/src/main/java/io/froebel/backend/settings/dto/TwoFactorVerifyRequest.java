package io.froebel.backend.settings.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TwoFactorVerifyRequest(
    @NotBlank(message = "Verification code is required")
    @Size(min = 6, max = 8, message = "Verification code must be 6-8 characters")
    String code
) {}
