package io.froebel.backend.category.service;

import io.froebel.backend.category.dto.request.CreateCategoryRequest;
import io.froebel.backend.category.dto.request.UpdateCategoryRequest;
import io.froebel.backend.category.dto.response.CategoryResponse;
import io.froebel.backend.exception.ResourceNotFoundException;
import io.froebel.backend.model.entity.Category;
import io.froebel.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getCategoryTree() {
        List<Category> rootCategories = categoryRepository.findByParentIsNullOrderBySortOrderAsc();
        return rootCategories.stream()
            .filter(category -> category.getIsActive() == null || category.getIsActive())
            .map(category -> CategoryResponse.from(category, true))
            .toList();
    }

    public CategoryResponse getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return CategoryResponse.from(category, true);
    }

    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return CategoryResponse.from(category, true);
    }

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        String slug = generateUniqueSlug(request.name());

        Category category = Category.builder()
            .name(request.name().trim())
            .slug(slug)
            .description(request.description())
            .icon(request.icon())
            .sortOrder(request.sortOrder())
            .color(request.color())
            .imageUrl(request.imageUrl())
            .isFeatured(request.isFeatured())
            .isActive(request.isActive())
            .build();

        if (request.parentId() != null) {
            Category parent = categoryRepository.findById(request.parentId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.parentId()));
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        return CategoryResponse.from(category, false);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (request.name() != null) {
            String newName = request.name().trim();
            if (!newName.equals(category.getName())) {
                category.setName(newName);
                category.setSlug(generateUniqueSlug(newName, id));
            }
        }

        if (request.description() != null) {
            category.setDescription(request.description());
        }

        if (request.icon() != null) {
            category.setIcon(request.icon());
        }

        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }

        if (request.parentId() != null) {
            if (request.parentId().equals(id)) {
                throw new IllegalArgumentException("Category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(request.parentId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.parentId()));
            category.setParent(parent);
        }

        if (request.color() != null) {
            category.setColor(request.color());
        }

        if (request.imageUrl() != null) {
            category.setImageUrl(request.imageUrl());
        }

        if (request.isFeatured() != null) {
            category.setIsFeatured(request.isFeatured());
        }

        if (request.isActive() != null) {
            category.setIsActive(request.isActive());
        }

        category = categoryRepository.save(category);
        return CategoryResponse.from(category, true);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
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
            var existing = categoryRepository.findBySlug(slug);
            if (existing.isEmpty() || (excludeId != null && existing.get().getId().equals(excludeId))) {
                return slug;
            }
            slug = baseSlug + "-" + counter++;
        }
    }
}
