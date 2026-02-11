package io.froebel.backend.settings.dto;

import java.time.Instant;

public record TwoFactorStatusResponse(
    boolean enabled,
    Instant enabledAt,
    int backupCodesRemaining
) {}
