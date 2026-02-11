package io.froebel.backend.settings.dto;

import java.util.List;

public record LinkedAccountsListResponse(
    List<LinkedAccountResponse> linkedAccounts,
    boolean hasPassword,
    List<String> availableProviders
) {}
