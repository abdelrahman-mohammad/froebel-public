package io.froebel.backend.settings.controller;

import io.froebel.backend.auth.security.UserPrincipal;
import io.froebel.backend.model.entity.DataExportRequest;
import io.froebel.backend.settings.dto.AccountDeletionStatusResponse;
import io.froebel.backend.settings.dto.DataExportStatusResponse;
import io.froebel.backend.settings.service.AccountDeletionService;
import io.froebel.backend.settings.service.DataExportService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settings/privacy")
public class PrivacyController {

    private final AccountDeletionService accountDeletionService;
    private final DataExportService dataExportService;

    public PrivacyController(
        AccountDeletionService accountDeletionService,
        DataExportService dataExportService
    ) {
        this.accountDeletionService = accountDeletionService;
        this.dataExportService = dataExportService;
    }

    // ========== Account Deletion ==========

    @PostMapping("/delete-account")
    public ResponseEntity<AccountDeletionStatusResponse> requestAccountDeletion(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody(required = false) io.froebel.backend.settings.dto.AccountDeletionRequest request
    ) {
        String reason = request != null ? request.reason() : null;
        AccountDeletionStatusResponse response = accountDeletionService.requestDeletion(principal.getId(), reason);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<Void> cancelAccountDeletion(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        accountDeletionService.cancelDeletion(principal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/delete-account/status")
    public ResponseEntity<AccountDeletionStatusResponse> getAccountDeletionStatus(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return accountDeletionService.getDeletionStatus(principal.getId())
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.noContent().build());
    }

    // ========== Data Export ==========

    @PostMapping("/export")
    public ResponseEntity<DataExportStatusResponse> requestDataExport(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        DataExportRequest request = dataExportService.requestExport(principal.getId());
        return ResponseEntity.ok(DataExportStatusResponse.from(request, null));
    }

    @GetMapping("/export")
    public ResponseEntity<List<DataExportStatusResponse>> getExportHistory(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<DataExportRequest> exports = dataExportService.getUserExports(principal.getId());
        List<DataExportStatusResponse> responses = exports.stream()
            .map(e -> DataExportStatusResponse.from(e, buildDownloadUrl(e)))
            .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/export/{exportId}/status")
    public ResponseEntity<DataExportStatusResponse> getExportStatus(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID exportId
    ) {
        return dataExportService.getExportStatus(principal.getId(), exportId)
            .map(e -> ResponseEntity.ok(DataExportStatusResponse.from(e, buildDownloadUrl(e))))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export/{exportId}/download")
    public ResponseEntity<Resource> downloadExport(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID exportId
    ) {
        Resource file = dataExportService.downloadExport(principal.getId(), exportId);

        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"froebel-data-export.zip\"")
            .body(file);
    }

    private String buildDownloadUrl(DataExportRequest request) {
        if (request.getStatus() != io.froebel.backend.model.enums.ExportStatus.COMPLETED) {
            return null;
        }
        return "/api/v1/settings/privacy/export/" + request.getId() + "/download";
    }
}
