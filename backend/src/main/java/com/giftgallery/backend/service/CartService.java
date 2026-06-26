package com.giftgallery.backend.service;

import com.giftgallery.backend.model.CartItem;
import com.giftgallery.backend.model.Product;
import com.giftgallery.backend.model.User;
import com.giftgallery.backend.repository.CartItemRepository;
import com.giftgallery.backend.repository.ProductRepository;
import com.giftgallery.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<CartItem> getCart(String userEmail) {
        User user = getUser(userEmail);
        return cartItemRepository.findByUserId(user.getId());
    }

    public CartItem addToCart(String userEmail, String productId, int quantity) {
        User user = getUser(userEmail);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        Optional<CartItem> existing = cartItemRepository
                .findByUserIdAndProductId(user.getId(), productId);

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + quantity);
            return cartItemRepository.save(item);
        }

        CartItem cartItem = CartItem.builder()
                .user(user)
                .product(product)
                .quantity(quantity)
                .build();

        return cartItemRepository.save(cartItem);
    }

    public CartItem updateQuantity(String userEmail, String cartItemId, int quantity) {
        User user = getUser(userEmail);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    public void removeFromCart(String userEmail, String cartItemId) {
        User user = getUser(userEmail);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(String userEmail) {
        User user = getUser(userEmail);
        cartItemRepository.deleteByUserId(user.getId());
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}