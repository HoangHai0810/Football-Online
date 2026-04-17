package com.example.football.service;

import com.example.football.entity.PlayerCard;
import com.example.football.entity.PlayerTemplate;
import com.example.football.entity.Season;
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

    private int getStatBonus(int level) {
        return switch (level) {
            case 2 -> 1;
            case 3 -> 2;
            case 4 -> 4;
            case 5 -> 6;
            case 6 -> 8;
            case 7 -> 11;
            case 8 -> 15;
            case 9 -> 18;
            case 10 -> 21;
            default -> 0;
        };
    }

    @Transactional
    public PlayerCard openRandomCardPack(Long userId, int cost, int minOvr, String seasonStr, int minLevel, int maxLevel) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (user.getCoins() < cost) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough coins to open this pack");
        }
        
        user.setCoins(user.getCoins() - cost);
        userRepository.save(user);
        
        List<PlayerTemplate> templates = fetchFilteredTemplates(minOvr, seasonStr);
        PlayerCard card = generateRandomCardFromList(user, templates, minLevel, maxLevel);
        return playerCardRepository.save(card);
    }

    @Transactional
    public List<PlayerCard> openMultipleRandomCardPacks(Long userId, int quantity, int costPerPack, int minOvr, String seasonStr, int minLevel, int maxLevel) {
        if (quantity < 1 || quantity > 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be between 1 and 10");
        }

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        long totalCost = (long) costPerPack * quantity;
        if (user.getCoins() < totalCost) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough coins to open " + quantity + " packs");
        }
        
        user.setCoins(user.getCoins() - totalCost);
        userRepository.save(user);

        List<PlayerTemplate> templates = fetchFilteredTemplates(minOvr, seasonStr);
        
        List<PlayerCard> cards = new java.util.ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            cards.add(generateRandomCardFromList(user, templates, minLevel, maxLevel));
        }
        return playerCardRepository.saveAll(cards);
    }

    private List<PlayerTemplate> fetchFilteredTemplates(int minOvr, String seasonStr) {
        List<PlayerTemplate> templates;
        if (seasonStr == null || seasonStr.isBlank()) {
            templates = playerTemplateRepository.findByOvrGreaterThanEqual(minOvr);
        } else {
            try {
                Season season = Season.valueOf(seasonStr.toUpperCase());
                templates = playerTemplateRepository.findByOvrGreaterThanEqualAndSeason(minOvr, season);
            } catch (IllegalArgumentException e) {
                // Fallback to manual filter if enum doesn't match exactly, or just empty
                templates = playerTemplateRepository.findByOvrGreaterThanEqual(minOvr)
                        .stream()
                        .filter(t -> t.getSeason().name().equalsIgnoreCase(seasonStr))
                        .toList();
            }
        }

        if (templates.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No player templates available for this criteria");
        }
        return templates;
    }

    private PlayerCard generateRandomCardFromList(Users user, List<PlayerTemplate> templates, int minLevel, int maxLevel) {
        double totalWeight = 0;
        for (PlayerTemplate t : templates) {
            totalWeight += 1.0 / Math.pow(t.getOvr(), 6);
        }

        double randomValue = random.nextDouble() * totalWeight;
        double currentWeightSum = 0;
        PlayerTemplate selectedTemplate = templates.get(0);

        for (PlayerTemplate t : templates) {
            currentWeightSum += 1.0 / Math.pow(t.getOvr(), 6);
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
                totalW += 1.0 / Math.pow(4, i - minLevel); 
            }
            double threshold = 0;
            for (int i = minLevel; i <= maxLevel; i++) {
                threshold += (1.0 / Math.pow(4, i - minLevel)) / totalW;
                if (r <= threshold) {
                    targetLevel = i;
                    break;
                }
            }
        }

        return PlayerCard.builder()
                .owner(user)
                .template(selectedTemplate)
                .upgradeLevel(targetLevel)
                .build();
    }

    @Transactional
    public com.example.football.dto.UpgradeResultDTO upgradeCard(Long targetCardId, List<Long> materialCardIds) {
        PlayerCard targetCard = playerCardRepository.findById(targetCardId)
                .orElseThrow(() -> new RuntimeException("Target card not found"));
        
        int originalLevel = targetCard.getUpgradeLevel();
        List<PlayerCard> materials = playerCardRepository.findAllById(materialCardIds);
        
        if (materials.isEmpty()) {
            throw new RuntimeException("No material cards provided or found");
        }
        if (materials.size() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 5 material cards allowed");
        }

        double totalChance = 0;
        int targetEffectiveOvr = targetCard.getTemplate().getOvr() + getStatBonus(targetCard.getUpgradeLevel());
        
        // Critical Success (Jump) calculation
        double criticalChance = 0;
        Long templateId = targetCard.getTemplate().getId();

        int safetyLevelFloor = 1;

        for (PlayerCard material : materials) {
            int materialEffectiveOvr = material.getTemplate().getOvr() + getStatBonus(material.getUpgradeLevel());
            double diffOvr = materialEffectiveOvr - targetEffectiveOvr;

            double contribution = 0.2 * Math.pow(1.5, diffOvr);
            totalChance += contribution;
            
            // Check for same-player fodder for jump chance and safety floor
            if (material.getTemplate().getId().equals(templateId)) {
                int materialLevel = material.getUpgradeLevel();
                safetyLevelFloor = Math.max(safetyLevelFloor, materialLevel);
                
                double fodderChance = 0.10; // 10% base for same level
                if (materialLevel < originalLevel) {
                    fodderChance = 0.10 - (double)(originalLevel - materialLevel) * 0.10 / originalLevel;
                }
                criticalChance += Math.max(0, fodderChance);
            }
        }

        totalChance = Math.min(1.0, totalChance);
        
        double levelMultiplier = BASE_SUCCESS_RATES.getOrDefault(originalLevel, 0.1);
        double finalSuccessRate = totalChance * levelMultiplier;

        boolean isSuccess = random.nextDouble() <= finalSuccessRate;
        boolean isCriticalSuccess = false;
        int intermediateLevel = originalLevel;

        if (isSuccess) {
            intermediateLevel = originalLevel + 1;
            targetCard.setUpgradeLevel(intermediateLevel);
            
            // Roll for jump if same-player fodder used
            if (criticalChance > 0 && random.nextDouble() <= criticalChance) {
                isCriticalSuccess = true;
                targetCard.setUpgradeLevel(targetCard.getUpgradeLevel() + 1); // Total +2 jump
            }
        } else {
            if (originalLevel > 1) {
                int dropAmount = random.nextInt(originalLevel - 1) + 1;
                int droppedLevel = Math.max(1, originalLevel - dropAmount);
                // Apply safety floor: cannot drop below the level of the best same-player fodder used
                targetCard.setUpgradeLevel(Math.max(droppedLevel, safetyLevelFloor));
            }
        }

        playerCardRepository.deleteAll(materials);
        PlayerCard savedCard = playerCardRepository.save(targetCard);

        return com.example.football.dto.UpgradeResultDTO.builder()
                .success(isSuccess)
                .card(savedCard)
                .originalLevel(originalLevel)
                .intermediateLevel(intermediateLevel)
                .criticalSuccess(isCriticalSuccess)
                .hasJumpChance(criticalChance > 0)
                .build();
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

    @Transactional
    public PlayerCard openPackById(Users user, String packId) {
        int minOvr = 0;
        String season = "";
        int minLvl = 1;
        int maxLvl = 1;

        switch (packId) {
            case "starter" -> { minOvr = 70; }
            case "veteran" -> { minOvr = 80; minLvl = 3; maxLvl = 6; }
            case "premium" -> { minOvr = 85; }
            case "live_master" -> { season = "LIVE"; minLvl = 5; maxLvl = 8; }
            case "all_star" -> { minOvr = 90; }
            case "toty_upgrade" -> { season = "TOTY"; minLvl = 2; maxLvl = 5; }
            case "golden_ticket" -> { minOvr = 85; minLvl = 8; maxLvl = 10; }
            case "icon" -> { season = "ICON"; }
        }

        List<PlayerTemplate> templates = fetchFilteredTemplates(minOvr, season);
        PlayerCard card = generateRandomCardFromList(user, templates, minLvl, maxLvl);
        return playerCardRepository.save(card);
    }
}
