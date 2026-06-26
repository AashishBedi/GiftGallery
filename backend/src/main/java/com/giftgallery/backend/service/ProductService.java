package com.giftgallery.backend.service;

import com.giftgallery.backend.model.Category;
import com.giftgallery.backend.model.Product;
import com.giftgallery.backend.repository.CategoryRepository;
import com.giftgallery.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;

    public Product createProduct(String name, String description,
                                 double price, int stock,
                                 String categoryId,
                                 List<MultipartFile> images) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        List<String> imageUrls = new ArrayList<>();
        if (images != null) {
            for (MultipartFile image : images) {
                String url = cloudinaryService.uploadImage(image);
                imageUrls.add(url);
            }
        }

        Product product = Product.builder()
                .name(name)
                .description(description)
                .price(new java.math.BigDecimal(price))
                .stock(stock)
                .category(category)
                .images(imageUrls)
                .isActive(true)
                .build();

        return productRepository.save(product);
    }

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findByIsActiveTrue(pageable);
    }

    public Page<Product> getProductsByCategory(String categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(query);
    }

    public Product updateProduct(String id, String name, String description,
                                 double price, int stock, String categoryId) {
        Product product = getProductById(id);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setName(name);
        product.setDescription(description);
        product.setPrice(new java.math.BigDecimal(price));
        product.setStock(stock);
        product.setCategory(category);

        return productRepository.save(product);
    }

    public void deleteProduct(String id) {
        Product product = getProductById(id);
        product.setIsActive(false);
        productRepository.save(product);
    }
}