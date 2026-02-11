package io.froebel.backend.profile.controller;

import io.froebel.backend.model.entity.Media;
import io.froebel.backend.profile.service.MediaService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping("/{mediaId}")
    public ResponseEntity<byte[]> getMedia(@PathVariable UUID mediaId) {
        Media media = mediaService.getMedia(mediaId);

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(media.getMimeType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + media.getFilename() + "\"")
            .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000, immutable")
            .body(media.getData());
    }
}
