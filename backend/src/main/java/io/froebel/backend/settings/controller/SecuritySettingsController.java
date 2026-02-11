package io.froebel.backend.settings.controller;

import io.froebel.backend.auth.security.UserPrincipal;
import io.froebel.backend.config.AppProperties;
import io.froebel.backend.settings.dto.BackupCodesResponse;
import io.froebel.backend.settings.dto.ChangeEmailRequest;
import io.froebel.backend.settings.dto.ConfirmEmailChangeRequest;
import io.froebel.backend.settings.dto.LinkedAccountsListResponse;
import io.froebel.backend.settings.dto.SessionListResponse;
import io.froebel.backend.settings.dto.SetPasswordRequest;
import io.froebel.backend.settings.dto.TwoFactorConfirmRequest;
import io.froebel.backend.settings.dto.TwoFactorSetupResponse;
import io.froebel.backend.settings.dto.TwoFactorStatusResponse;
import io.froebel.backend.settings.dto.TwoFactorVerifyRequest;
import io.froebel.backend.settings.service.AccountLinkingService;
import io.froebel.backend.settings.service.EmailChangeService;
import io.froebel.backend.settings.service.SessionManagementService;
import io.froebel.backend.settings.service.TwoFactorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settings/security")
public class SecuritySettingsController {

    private final SessionManagementService sessionManagementService;
    private final TwoFactorService twoFactorService;
    private final AccountLinkingService accountLinkingService;
    private final EmailChangeService emailChangeService;
    private final AppProperties appProperties;

    public SecuritySettingsController(
        SessionManagementService sessionManagementService,
        TwoFactorService twoFactorService,
        AccountLinkingService accountLinkingService,
        EmailChangeService emailChangeService,
        AppProperties appProperties
    ) {
        this.sessionManagementService = sessionManagementService;
        this.twoFactorService = twoFactorService;
        this.accountLinkingService = accountLinkingService;
        this.emailChangeService = emailChangeService;
        this.appProperties = appProperties;
    }

    @GetMapping("/sessions")
    public ResponseEntity<SessionListResponse> getActiveSessions(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentSessionId = principal.getSessionId();
        return ResponseEntity.ok(
            sessionManagementService.getActiveSessions(principal.getId(), currentSessionId)
        );
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> revokeSession(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable UUID sessionId
    ) {
        // Prevent revoking current session via this endpoint
        if (principal.getSessionId() != null && principal.getSessionId().equals(sessionId)) {
            return ResponseEntity.badRequest().build();
        }

        sessionManagementService.revokeSession(principal.getId(), sessionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sessions/revoke-all")
    public ResponseEntity<Void> revokeAllOtherSessions(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        UUID currentSessionId = principal.getSessionId();
        if (currentSessionId != null) {
            sessionManagementService.revokeAllOtherSessions(principal.getId(), currentSessionId);
        } else {
            sessionManagementService.revokeAllSessions(principal.getId());
        }
        return ResponseEntity.noContent().build();
    }

    // ========== Two-Factor Authentication ==========

    @GetMapping("/2fa/status")
    public ResponseEntity<TwoFactorStatusResponse> getTwoFactorStatus(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(twoFactorService.getStatus(principal.getId()));
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<TwoFactorSetupResponse> setupTwoFactor(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(twoFactorService.setup(principal.getId()));
    }

    @PostMapping("/2fa/confirm")
    public ResponseEntity<BackupCodesResponse> confirmTwoFactor(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody TwoFactorConfirmRequest request
    ) {
        return ResponseEntity.ok(twoFactorService.confirm(principal.getId(), request.code()));
    }

    @DeleteMapping("/2fa")
    public ResponseEntity<Void> disableTwoFactor(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody TwoFactorVerifyRequest request
    ) {
        twoFactorService.disable(principal.getId(), request.code());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/2fa/backup-codes")
    public ResponseEntity<BackupCodesResponse> regenerateBackupCodes(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody TwoFactorVerifyRequest request
    ) {
        return ResponseEntity.ok(
            twoFactorService.regenerateBackupCodes(principal.getId(), request.code())
        );
    }

    // ========== Linked Accounts (OAuth) ==========

    @GetMapping("/linked-accounts")
    public ResponseEntity<LinkedAccountsListResponse> getLinkedAccounts(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(accountLinkingService.getLinkedAccounts(principal.getId()));
    }

    @PostMapping("/linked-accounts/{provider}/link")
    public ResponseEntity<Void> linkAccount(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String provider
    ) {
        String authUrl = accountLinkingService.buildLinkingUrl(principal.getId(), provider);
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(authUrl))
            .build();
    }

    @GetMapping("/linked-accounts/{provider}/callback")
    public ResponseEntity<Void> handleLinkCallback(
        @PathVariable String provider,
        @RequestParam String code,
        @RequestParam String state,
        HttpServletRequest request
    ) {
        String ipAddress = request.getRemoteAddr();
        accountLinkingService.processLinkCallback(provider, code, state, ipAddress);

        // Redirect to frontend settings page with success message
        String redirectUrl = appProperties.getFrontendUrl() + "/settings/security?linked=" + provider;
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(redirectUrl))
            .build();
    }

    @DeleteMapping("/linked-accounts/{provider}")
    public ResponseEntity<Void> unlinkAccount(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable String provider,
        HttpServletRequest request
    ) {
        String ipAddress = request.getRemoteAddr();
        accountLinkingService.unlinkAccount(principal.getId(), provider, ipAddress);
        return ResponseEntity.noContent().build();
    }

    // ========== Email Change ==========

    @PostMapping("/email/change")
    public ResponseEntity<Void> requestEmailChange(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ChangeEmailRequest request,
        HttpServletRequest httpRequest
    ) {
        String ipAddress = httpRequest.getRemoteAddr();
        emailChangeService.requestEmailChange(
            principal.getId(),
            request.newEmail(),
            request.password(),
            ipAddress
        );
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/email/confirm")
    public ResponseEntity<Void> confirmEmailChange(
        @Valid @RequestBody ConfirmEmailChangeRequest request,
        HttpServletRequest httpRequest
    ) {
        String ipAddress = httpRequest.getRemoteAddr();
        emailChangeService.confirmEmailChange(request.token(), ipAddress);
        return ResponseEntity.ok().build();
    }

    // ========== Password Management ==========

    @PostMapping("/password/set")
    public ResponseEntity<Void> setPassword(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody SetPasswordRequest request,
        HttpServletRequest httpRequest
    ) {
        String ipAddress = httpRequest.getRemoteAddr();
        emailChangeService.setPassword(principal.getId(), request.password(), ipAddress);
        return ResponseEntity.ok().build();
    }
}
