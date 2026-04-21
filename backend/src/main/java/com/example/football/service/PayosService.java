package com.example.football.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

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

            PaymentData paymentData = PaymentData.builder()
                    .orderCode(orderCode)
                    .amount(amount)
                    .description(description)
                    .item(item)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .build();

            CheckoutResponseData data = payOS.createPaymentLink(paymentData);
            return data.getCheckoutUrl();
        } catch (Exception e) {
            log.error("Failed to create PayOS link: ", e);
            throw new RuntimeException("Failed to initiate payment. Please try again.");
        }
    }

    public WebhookData verifyWebhook(Webhook webhook) {
        try {
            return payOS.verifyPaymentWebhookData(webhook);
        } catch (Exception e) {
            log.error("PayOS Webhook Verification Failed: ", e);
            throw new RuntimeException("Invalid webhook signature");
        }
    }
}
