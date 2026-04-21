package com.example.football.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.ItemData;

import java.util.Collections;
import java.util.List;

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
            ItemData item = ItemData.builder()
                    .name("FC Coins Package")
                    .quantity(1)
                    .price(amount)
                    .build();

            CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount((long) amount)
                    .description(description)
                    .items(Collections.singletonList(item))
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .build();

            CreatePaymentLinkResponse response = payOS.paymentRequests().create(request);
            return response.getCheckoutUrl();
        } catch (Exception e) {
            log.error("Failed to create PayOS link (v2): ", e);
            throw new RuntimeException("Failed to initiate payment: " + e.getMessage());
        }
    }

    public Object verifyWebhook(Object webhook) {
        try {
            return payOS.webhooks().verify(webhook);
        } catch (Exception e) {
            log.error("PayOS Webhook Verification Failed (v2): ", e);
            throw new RuntimeException("Invalid webhook signature");
        }
    }
}
