package com.giftgallery.backend.controller;

import com.giftgallery.backend.model.Order;
import com.giftgallery.backend.service.OrderService;
import com.giftgallery.backend.service.PaymentService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, String>> createPaymentOrder(
            @RequestBody Map<String, String> request) throws RazorpayException {
        BigDecimal amount = new BigDecimal(request.get("amount"));
        return ResponseEntity.ok(paymentService.createOrder(amount));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            Authentication authentication,
            @RequestBody Map<String, String> request) {

        String razorpayOrderId = request.get("razorpayOrderId");
        String paymentId = request.get("paymentId");
        String signature = request.get("signature");
        String orderId = request.get("orderId");

        boolean isValid = paymentService.verifyPayment(razorpayOrderId, paymentId, signature);

        if (isValid) {
            // Update status AND persist the Razorpay payment ID
            orderService.confirmPayment(orderId, paymentId, Order.OrderStatus.PROCESSING);
            return ResponseEntity.ok(Map.of(
                    "message", "Payment verified successfully",
                    "orderId", orderId,
                    "status", "PROCESSING"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Payment verification failed"
            ));
        }
    }
}