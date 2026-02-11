package io.froebel.backend.profile.controller;

import io.froebel.backend.auth.security.UserPrincipal;
import io.froebel.backend.model.entity.Media;
import io.froebel.backend.profile.dto.ProfileResponse;
import io.froebel.backend.profile.dto.PublicProfileResponse;
import io.froebel.backend.profile.dto.UpdatePrivacyRequest;
import io.froebel.backend.profile.dto.UpdateProfileRequest;
import io.froebel.backend.profile.service.MediaService;
import io.froebel.backend.profile.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final MediaService mediaService;

    public ProfileController(ProfileService profileService, MediaService mediaService) {
        this.profileService = profileService;
        this.mediaService = mediaService;
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(profileService.getProfile(principal.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(profileService.updateProfile(principal.getId(), request));
    }

    @PutMapping("/me/privacy")
    public ResponseEntity<ProfileResponse> updateMyPrivacy(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestBody UpdatePrivacyRequest request
    ) {
        return ResponseEntity.ok(profileService.updatePrivacy(principal.getId(), request));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> uploadAvatar(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam("file") MultipartFile file
    ) throws IOException {
        Media media = mediaService.uploadAvatar(principal.getId(), file);
        String avatarUrl = "/api/v1/media/" + media.getId();
        return ResponseEntity.ok(profileService.updateAvatar(principal.getId(), avatarUrl));
    }

    @DeleteMapping("/me/avatar")
    public ResponseEntity<ProfileResponse> deleteAvatar(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(profileService.deleteAvatar(principal.getId()));
    }

    @GetMapping("/public/{userId}")
    public ResponseEntity<PublicProfileResponse> getPublicProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getPublicProfile(userId));
    }
}
