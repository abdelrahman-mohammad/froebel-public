package io.froebel.backend.category.dto.response;

import io.froebel.backend.model.entity.Category;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CategoryResponse(
    UUID id,
    String name,
    String slug,
    String description,
    UUID parentId,
    String icon,
    Integer sortOrder,
    Integer usageCount,
    String color,
    String imageUrl,
    Boolean isFeatured,
    Boolean isActive,
    List<CategoryResponse> children,
    Instant createdAt,
    Instant updatedAt
) {
    public static CategoryResponse from(Category category) {
        return from(category, false);
    }

    public static CategoryResponse from(Category category, boolean includeChildren) {
        List<CategoryResponse> children = null;
        if (includeChildren && category.getChildren() != null && !category.getChildren().isEmpty()) {
            children = category.getChildren().stream()
                .filter(child -> child.getIsActive() == null || child.getIsActive())
                .sorted((a, b) -> {
                    int orderCompare = Integer.compare(
                        a.getSortOrder() != null ? a.getSortOrder() : 0,
                        b.getSortOrder() != null ? b.getSortOrder() : 0
                    );
                    return orderCompare != 0 ? orderCompare : a.getName().compareToIgnoreCase(b.getName());
                })
                .map(child -> CategoryResponse.from(child, true))
                .toList();
        }

        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getSlug(),
            category.getDescription(),
            category.getParent() != null ? category.getParent().getId() : null,
            category.getIcon(),
            category.getSortOrder(),
            category.getUsageCount(),
            category.getColor(),
            category.getImageUrl(),
            category.getIsFeatured(),
            category.getIsActive(),
            children,
            category.getCreatedAt(),
            category.getUpdatedAt()
        );
    }
}
