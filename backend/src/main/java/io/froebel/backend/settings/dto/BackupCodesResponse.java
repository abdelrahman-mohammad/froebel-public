package io.froebel.backend.settings.dto;

import java.util.List;

public record BackupCodesResponse(
    List<String> codes,
    String message
) {
    public static BackupCodesResponse of(List<String> codes) {
        return new BackupCodesResponse(
            codes,
            "Store these backup codes securely. Each code can only be used once."
        );
    }
}
