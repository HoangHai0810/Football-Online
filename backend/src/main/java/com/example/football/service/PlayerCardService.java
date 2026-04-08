package com.example.football.service;

import com.example.football.entity.PlayerCard;
import com.example.football.entity.PlayerTemplate;
import com.example.football.entity.Users;
import com.example.football.repository.PlayerCardRepository;
import com.example.football.repository.PlayerTemplateRepository;
import com.example.football.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PlayerCardService {

    private final PlayerCardRepository playerCardRepository;
    private final PlayerTemplateRepository playerTemplateRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    private static final Map<Integer, Double> BASE_SUCCESS_RATES = Map.of(
            1, 1.0,
            2, 0.81,
            3, 0.64,
            4, 0.50,
            5, 0.26,
            6, 0.15,
            7, 0.07,
            8, 0.04,
            9, 0.02
    );

    public List<PlayerCard> getCardsByUserId(Long userId) {
        return playerCardRepository.findByOwnerId(userId);
    }

    public PlayerCard openRandomCardPack(Long userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<PlayerTemplate> templates = playerTemplateRepository.findAll();
        if (templates.isEmpty()) {
            throw new RuntimeException("No player templates available");
        }

        double totalWeight = 0;
        for (PlayerTemplate t : templates) {
            totalWeight += 1.0 / Math.pow(t.getOvr(), 3);
        }

        double randomValue = random.nextDouble() * totalWeight;
        double currentWeightSum = 0;
        PlayerTemplate selectedTemplate = templates.get(0);

        for (PlayerTemplate t : templates) {
            currentWeightSum += 1.0 / Math.pow(t.getOvr(), 3);
            if (randomValue <= currentWeightSum) {
                selectedTemplate = t;
                break;
            }
        }

        PlayerCard card = PlayerCard.builder()
                .owner(user)
                .template(selectedTemplate)
                .upgradeLevel(1)
                .build();

        return playerCardRepository.save(card);
    }

    @Transactional
    public PlayerCard upgradeCard(Long targetCardId, List<Long> materialCardIds) {
        PlayerCard targetCard = playerCardRepository.findById(targetCardId)
                .orElseThrow(() -> new RuntimeException("Target card not found"));
        
        List<PlayerCard> materials = playerCardRepository.findAllById(materialCardIds);
        if (materials.isEmpty()) {
            throw new RuntimeException("No material cards provided or found");
        }

        // Calculate success probability
        // Logic: Each material contributes based on its OVR relative to target OVR
        double totalChance = 0;
        int targetOvr = targetCard.getTemplate().getOvr();

        for (PlayerCard material : materials) {
            int materialOvr = material.getTemplate().getOvr();
            double diff = materialOvr - targetOvr;
            
            // phôi OVR = target OVR -> 20% contribution
            // Mỗi 1 OVR lệch nhau -> thay đổi 1.5x (gần giống FC Online)
            double contribution = 0.2 * Math.pow(1.5, diff);
            totalChance += contribution;
        }

        // Clip totalChance at 1.0 (100%)
        totalChance = Math.min(1.0, totalChance);
        
        // Apply level multiplier (higher levels are harder even with max phôi)
        double levelMultiplier = BASE_SUCCESS_RATES.getOrDefault(targetCard.getUpgradeLevel(), 0.1);
        double finalSuccessRate = totalChance * levelMultiplier;

        boolean isSuccess = random.nextDouble() <= finalSuccessRate;

        if (isSuccess) {
            targetCard.setUpgradeLevel(targetCard.getUpgradeLevel() + 1);
        } else {
            // In many games, failing keeps the level or drops it. We'll keep it for now.
            // But we consume the materials anyway.
        }

        // Consume (delete) material cards
        playerCardRepository.deleteAll(materials);

        return playerCardRepository.save(targetCard);
    }
}
