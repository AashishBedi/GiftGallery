package com.giftgallery.backend.repository;

import com.giftgallery.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, String> {
    Page<Product> findByIsActiveTrue(Pageable pageable);
    Page<Product> findByCategoryIdAndIsActiveTrue(String categoryId, Pageable pageable);
    List<Product> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
}