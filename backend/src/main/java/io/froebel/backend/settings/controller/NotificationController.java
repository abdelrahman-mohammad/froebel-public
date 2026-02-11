package io.froebel.backend.settings.controller;

import io.froebel.backend.auth.security.UserPrincipal;
import io.froebel.backend.settings.dto.NotificationPreferencesResponse;
import io.froebel.backend.settings.dto.UpdateNotificationPreferencesRequest;
import io.froebel.backend.settings.service.NotificationPreferenceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/settings/notifications")
public class NotificationController {

    private final NotificationPreferenceService notificationPreferenceService;

    public NotificationController(NotificationPreferenceService notificationPreferenceService) {
        this.notificationPreferenceService = notificationPreferenceService;
    }

    @GetMapping
    public ResponseEntity<NotificationPreferencesResponse> getPreferences(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(notificationPreferenceService.getPreferences(principal.getId()));
    }

    @PutMapping
    public ResponseEntity<NotificationPreferencesResponse> updatePreferences(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody UpdateNotificationPreferencesRequest request
    ) {
        return ResponseEntity.ok(notificationPreferenceService.updatePreferences(principal.getId(), request));
    }

    @PostMapping("/unsubscribe-all")
    public ResponseEntity<NotificationPreferencesResponse> unsubscribeFromMarketing(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(notificationPreferenceService.unsubscribeFromMarketing(principal.getId()));
    }
}
