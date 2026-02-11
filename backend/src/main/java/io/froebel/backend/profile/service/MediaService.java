package io.froebel.backend.profile.service;

import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.Media;
import io.froebel.backend.model.entity.User;
import io.froebel.backend.model.enums.StorageType;
import io.froebel.backend.repository.MediaRepository;
import io.froebel.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    );

    private final MediaRepository mediaRepository;
    private final UserRepository userRepository;

    public MediaService(MediaRepository mediaRepository, UserRepository userRepository) {
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Media uploadAvatar(UUID userId, MultipartFile file) throws IOException {
        validateFile(file);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String filename = generateFilename(file.getOriginalFilename());

        Media media = Media.builder()
            .filename(filename)
            .originalFilename(file.getOriginalFilename())
            .mimeType(file.getContentType())
            .sizeBytes(file.getSize())
            .data(file.getBytes())
            .storageType(StorageType.DATABASE)
            .uploader(user)
            .build();

        return mediaRepository.save(media);
    }

    public Media getMedia(UUID mediaId) {
        return mediaRepository.findById(mediaId)
            .orElseThrow(() -> new ResourceNotFoundException("Media", "id", mediaId));
    }

    @Transactional
    public void deleteMedia(UUID mediaId) {
        if (!mediaRepository.existsById(mediaId)) {
            throw new ResourceNotFoundException("Media", "id", mediaId);
        }
        mediaRepository.deleteById(mediaId);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: JPEG, PNG, WebP, GIF");
        }
    }

    private String generateFilename(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID() + extension;
    }
}
