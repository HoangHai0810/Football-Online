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
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

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

    public PlayerCard openRandomCardPack(Long userId, int cost, int minOvr, String seasonStr, int minLevel, int maxLevel) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (user.getCoins() < cost) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough coins to open this pack");
        }
        
        user.setCoins(user.getCoins() - cost);
        userRepository.save(user);
        
        List<PlayerTemplate> templates = playerTemplateRepository.findAll()
                .stream()
                .filter(t -> t.getOvr() >= minOvr)
                .filter(t -> seasonStr == null || seasonStr.isBlank() || t.getSeason().name().equalsIgnoreCase(seasonStr))
                .toList();

        if (templates.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No player templates available for this criteria");
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

        int targetLevel = minLevel;
        if (maxLevel > minLevel) {
            double r = random.nextDouble();
            double totalW = 0;
            for (int i = minLevel; i <= maxLevel; i++) {
                totalW += 1.0 / Math.pow(2, i - minLevel); // Drop rate halves each level step
            }
            double threshold = 0;
            for (int i = minLevel; i <= maxLevel; i++) {
                threshold += (1.0 / Math.pow(2, i - minLevel)) / totalW;
                if (r <= threshold) {
                    targetLevel = i;
                    break;
                }
            }
        }

        PlayerCard card = PlayerCard.builder()
                .owner(user)
                .template(selectedTemplate)
                .upgradeLevel(targetLevel)
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
        if (materials.size() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 5 material cards allowed");
        }

        double totalChance = 0;
        int targetOvr = targetCard.getTemplate().getOvr();

        for (PlayerCard material : materials) {
            int materialOvr = material.getTemplate().getOvr();
            double diff = materialOvr - targetOvr;

            double contribution = 0.2 * Math.pow(1.5, diff);
            totalChance += contribution;
        }

        totalChance = Math.min(1.0, totalChance);
        
        double levelMultiplier = BASE_SUCCESS_RATES.getOrDefault(targetCard.getUpgradeLevel(), 0.1);
        double finalSuccessRate = totalChance * levelMultiplier;

        boolean isSuccess = random.nextDouble() <= finalSuccessRate;

        if (isSuccess) {
            targetCard.setUpgradeLevel(targetCard.getUpgradeLevel() + 1);
        } else {
            int currentLevel = targetCard.getUpgradeLevel();
            if (currentLevel > 1) {
                int dropAmount = random.nextInt(currentLevel - 1) + 1;
                targetCard.setUpgradeLevel(Math.max(1, currentLevel - dropAmount));
            }
        }

        playerCardRepository.deleteAll(materials);

        return playerCardRepository.save(targetCard);
    }

    @Transactional
    public PlayerCard buyPlayer(Long userId, Long templateId, int cost) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (user.getCoins() < cost) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough coins to buy this player");
        }
        
        PlayerTemplate template = playerTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found in market"));
                
        user.setCoins(user.getCoins() - cost);
        userRepository.save(user);

        PlayerCard card = PlayerCard.builder()
                .owner(user)
                .template(template)
                .upgradeLevel(1)
                .build();

        return playerCardRepository.save(card);
    }
}
