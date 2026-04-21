package com.example.football.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class PayosService {

    private final PayOS payOS;

    public PayosService(
            @Value("${payos.client-id}") String clientId,
            @Value("${payos.api-key}") String apiKey,
            @Value("${payos.checksum-key}") String checksumKey) {
        this.payOS = new PayOS(clientId, apiKey, checksumKey);
    }

    public String createPaymentLink(Long orderCode, int amount, String description, String cancelUrl, String returnUrl) {
        try {
            vn.payos.model.v2.paymentRequests.ItemData item = vn.payos.model.v2.paymentRequests.ItemData.builder()
                    .name("FC Coins Package")
                    .quantity(1)
                    .price((long) amount)
                    .build();

            vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest request = vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount((long) amount)
                    .description(description)
                    .items(Collections.singletonList(item))
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .build();

            vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse response = payOS.paymentRequests().create(request);
            return response.getCheckoutUrl();
        } catch (Exception e) {
            log.error("Failed to create PayOS link (v2.0.1): ", e);
            throw new RuntimeException("Failed to initiate payment: " + e.getMessage());
        }
    }

    public Object verifyWebhook(Map<String, Object> body) {
        try {
            vn.payos.model.v2.webhooks.Webhook webhook = vn.payos.model.v2.webhooks.Webhook.builder()
                .code(body.get("code") != null ? body.get("code").toString() : null)
                .desc(body.get("desc") != null ? body.get("desc").toString() : null)
                .data(body.get("data") != null ? (vn.payos.model.v2.webhooks.WebhookData) body.get("data") : null)
                .signature(body.get("signature") != null ? body.get("signature").toString() : null)
                .build();
            return payOS.webhooks().verify(webhook);
        } catch (Exception e) {
            log.error("PayOS Webhook Verification Failed (Defensive Mapping): ", e);
            throw new RuntimeException("Invalid webhook signature");
        }
    }
}
