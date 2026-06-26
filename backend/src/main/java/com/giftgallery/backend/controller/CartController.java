package com.giftgallery.backend.controller;

import com.giftgallery.backend.model.CartItem;
import com.giftgallery.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCart(authentication.getName()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {
        String productId = (String) request.get("productId");
        int quantity = (int) request.get("quantity");
        return ResponseEntity.ok(cartService.addToCart(
                authentication.getName(), productId, quantity));
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItem> updateQuantity(
            Authentication authentication,
            @PathVariable String cartItemId,
            @RequestBody Map<String, Integer> request) {
        return ResponseEntity.ok(cartService.updateQuantity(
                authentication.getName(), cartItemId, request.get("quantity")));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(
            Authentication authentication,
            @PathVariable String cartItemId) {
        cartService.removeFromCart(authentication.getName(), cartItemId);
        return ResponseEntity.noContent().build();
    }
}