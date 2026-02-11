package io.froebel.backend.tag.service;

import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.Tag;
import io.froebel.backend.repository.TagRepository;
import io.froebel.backend.tag.dto.request.CreateTagRequest;
import io.froebel.backend.tag.dto.request.UpdateTagRequest;
import io.froebel.backend.tag.dto.response.TagResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public List<TagResponse> getAllTags() {
        return tagRepository.findAll().stream()
            .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
            .map(TagResponse::from)
            .toList();
    }

    public TagResponse getTagById(UUID id) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag", "id", id));
        return TagResponse.from(tag);
    }

    public TagResponse getTagBySlug(String slug) {
        Tag tag = tagRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Tag", "slug", slug));
        return TagResponse.from(tag);
    }

    @Transactional
    public TagResponse createTag(CreateTagRequest request) {
        String slug = generateUniqueSlug(request.name());

        Tag tag = Tag.builder()
            .name(request.name().trim())
            .slug(slug)
            .color(request.color())
            .icon(request.icon())
            .build();

        tag = tagRepository.save(tag);
        return TagResponse.from(tag);
    }

    @Transactional
    public TagResponse updateTag(UUID id, UpdateTagRequest request) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag", "id", id));

        if (request.name() != null) {
            String newName = request.name().trim();
            if (!newName.equals(tag.getName())) {
                tag.setName(newName);
                tag.setSlug(generateUniqueSlug(newName, id));
            }
        }

        if (request.color() != null) {
            tag.setColor(request.color());
        }

        if (request.icon() != null) {
            tag.setIcon(request.icon());
        }

        tag = tagRepository.save(tag);
        return TagResponse.from(tag);
    }

    @Transactional
    public void deleteTag(UUID id) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag", "id", id));
        tagRepository.delete(tag);
    }

    private String generateSlug(String name) {
        return name.trim()
            .toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-");
    }

    private String generateUniqueSlug(String name) {
        return generateUniqueSlug(name, null);
    }

    private String generateUniqueSlug(String name, UUID excludeId) {
        String baseSlug = generateSlug(name);
        String slug = baseSlug;
        int counter = 1;

        while (true) {
            var existing = tagRepository.findBySlug(slug);
            if (existing.isEmpty() || (excludeId != null && existing.get().getId().equals(excludeId))) {
                return slug;
            }
            slug = baseSlug + "-" + counter++;
        }
    }
}
