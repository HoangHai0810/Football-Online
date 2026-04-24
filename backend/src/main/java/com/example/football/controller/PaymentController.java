package com.example.football.controller;

import com.example.football.entity.TopupOrder;
import com.example.football.repository.TopupOrderRepository;
import com.example.football.repository.UserRepository;
import com.example.football.service.PayosService;
import com.example.football.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/payments/payos")
@RequiredArgsConstructor
public class PaymentController {

    private final PayosService payosService;
    private final TopupOrderRepository topupOrderRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    
    @Value("${app.frontend.url:https://football-frontend-9asm.onrender.com}")
    private String frontendUrl;

    @PostMapping("/create")
    public ResponseEntity<?> createPaymentLink(@RequestParam long packageId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).map(user -> {
            
            int     amountVnd     = 0;
            int     coinsReward   = 0;
            String  rewardPackId  = null;
            Integer rewardPackQty = 0;

            if (packageId == 1) { amountVnd = 10000; coinsReward = 100000; }
            else if (packageId == 2) { amountVnd = 20000; coinsReward = 220000; }
            else if (packageId == 3) { amountVnd = 50000; coinsReward = 600000; }
            else if (packageId == 4) { amountVnd = 100000; coinsReward = 1500000; rewardPackId = "premium"; rewardPackQty = 1; }
            else if (packageId == 5) { amountVnd = 200000; coinsReward = 3500000; rewardPackId = "all_star"; rewardPackQty = 2; }
            else if (packageId == 6) { amountVnd = 500000; coinsReward = 10000000; rewardPackId = "icon"; rewardPackQty = 1; }
            else { return ResponseEntity.badRequest().body(Map.of("message", "Invalid package")); }

            long orderCode = Long.parseLong(String.valueOf(System.currentTimeMillis()).substring(3) + (int)(Math.random() * 99));

            TopupOrder order = TopupOrder.builder()
                    .orderCode(orderCode)
                    .userId(user.getId())
                    .coinsAmount(coinsReward)
                    .priceVnd(amountVnd)
                    .rewardPackId(rewardPackId)
                    .rewardPackQuantity(rewardPackQty)
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .build();
            topupOrderRepository.save(order);

            String description = "NAP " + username;
            if (description.length() > 25) {
                description = description.substring(0, 25);
            }

            String returnUrl = frontendUrl + "/dashboard?payment_success=true";
            String cancelUrl = frontendUrl + "/dashboard?payment_cancel=true";

            String checkoutUrl = payosService.createPaymentLink(orderCode, amountVnd, description, cancelUrl, returnUrl);
            return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl, "orderCode", orderCode));
            
        }).orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handlePayOSWebhook(@RequestBody Map<String, Object> body) {
        log.info("Received PayOS Webhook (Defensive Map): {}", body);
        try {
            Object verifiedData = payosService.verifyWebhook(body);
            
            Long orderCode = null;
            try {
                orderCode = (Long) verifiedData.getClass().getMethod("getOrderCode").invoke(verifiedData);
            } catch (Exception e) {
                log.warn("Reflection extraction failed, trying direct property check");
                if (body.get("data") instanceof Map) {
                    orderCode = Long.valueOf(((Map<?,?>)body.get("data")).get("orderCode").toString());
                }
            }
            
            if (orderCode != null) {
                Optional<TopupOrder> orderOpt = topupOrderRepository.findByOrderCode(orderCode);
                if (orderOpt.isPresent()) {
                    TopupOrder order = orderOpt.get();
                    if ("PENDING".equals(order.getStatus())) {
                        order.setStatus("SUCCESS");
                        topupOrderRepository.save(order);
                        
                        userRepository.findById(order.getUserId()).ifPresent(u -> {
                            u.setCoins(u.getCoins() + order.getCoinsAmount());
                            userRepository.save(u);
                            log.info("Successfully added {} coins to user id: {} via verified webhook", order.getCoinsAmount(), u.getId());

                            if (order.getRewardPackId() != null && order.getRewardPackQuantity() > 0) {
                                try {
                                    inventoryService.addPack(u, order.getRewardPackId(), order.getRewardPackQuantity());
                                    log.info("Successfully added {}x pack '{}' to user id: {}", 
                                        order.getRewardPackQuantity(), order.getRewardPackId(), u.getId());
                                } catch (Exception ex) {
                                    log.error("Failed to add reward pack to user inventory", ex);
                                }
                            }
                        });
                    }
                } else {
                    log.warn("TopupOrder not found for verified orderCode: {}", orderCode);
                }
            }
            
            return ResponseEntity.ok(Map.of("success", true));
            
        } catch (Exception e) {
            log.error("PayOS Webhook verification or processing failed (registration ping or invalid callback)", e);
            return ResponseEntity.ok(Map.of("success", false, "message", "Processing failed but ping received"));
        }
    }
}
