package io.froebel.backend.settings.dto;

public record TwoFactorSetupResponse(
    String secret,
    String qrCodeUri
) {}
