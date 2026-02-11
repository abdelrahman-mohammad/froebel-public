package io.froebel.backend.settings.dto;

import io.froebel.backend.model.entity.LinkedAccount;

import java.time.Instant;

public record LinkedAccountResponse(
    String provider,
    String providerEmail,
    Instant linkedAt
) {
    public static LinkedAccountResponse from(LinkedAccount linkedAccount) {
        return new LinkedAccountResponse(
            linkedAccount.getProvider(),
            linkedAccount.getProviderEmail(),
            linkedAccount.getLinkedAt()
        );
    }
}
