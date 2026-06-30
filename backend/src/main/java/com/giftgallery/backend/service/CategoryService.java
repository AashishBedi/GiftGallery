package com.giftgallery.backend.service;

import com.giftgallery.backend.model.Category;
import com.giftgallery.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public Category createCategory(Category category) {
        if (category.getName() == null || category.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }
        if (categoryRepository.existsByName(category.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category already exists");
        }
        // Ensure slug is always set (in case @PrePersist fires before name is set)
        category.setSlug(category.getName().toLowerCase().replace(" ", "-"));
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    public Category updateCategory(String id, Category updated) {
        Category existing = getCategoryById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setIconUrl(updated.getIconUrl());
        existing.setSlug(updated.getName().toLowerCase().replace(" ", "-"));
        return categoryRepository.save(existing);
    }

    public void deleteCategory(String id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
        }
        categoryRepository.deleteById(id);
    }
}