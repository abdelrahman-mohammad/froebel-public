package io.froebel.backend.tag.dto.response;

import io.froebel.backend.model.entity.Tag;

import java.time.Instant;
import java.util.UUID;

public record TagResponse(
    UUID id,
    String name,
    String slug,
    String color,
    String icon,
    Integer usageCount,
    Instant createdAt
) {
    public static TagResponse from(Tag tag) {
        return new TagResponse(
            tag.getId(),
            tag.getName(),
            tag.getSlug(),
            tag.getColor(),
            tag.getIcon(),
            tag.getUsageCount(),
            tag.getCreatedAt()
        );
    }
}
