package com.example.football.controller;

import com.example.football.entity.PlayerCard;
import com.example.football.entity.MissionType;
import com.example.football.service.PlayerCardService;
import com.example.football.service.MissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlayerCardController {

    private final PlayerCardService playerCardService;
    private final MissionService missionService;

    @GetMapping("/user/{userId}")
    public List<PlayerCard> getCardsByUserId(@PathVariable Long userId) {
        return playerCardService.getCardsByUserId(userId);
    }

    @PostMapping("/open-pack")
    public PlayerCard openPack(@RequestParam Long userId) {
        PlayerCard card = playerCardService.openRandomCardPack(userId);
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            missionService.updateProgress(username, MissionType.OPEN_PACK, 1);
            missionService.updateProgress(username, MissionType.COLLECT_PLAYER, 1);
        } catch (Exception e) {
            // Log error but don't fail the pack opening if mission update fails
            System.err.println("Failed to update mission progress: " + e.getMessage());
        }
        return card;
    }

    @PostMapping("/upgrade")
    public PlayerCard upgradeCard(@RequestParam Long targetCardId, @RequestBody List<Long> materialCardIds) {
        PlayerCard result = playerCardService.upgradeCard(targetCardId, materialCardIds);
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            missionService.updateProgress(username, MissionType.UPGRADE_PLAYER, 1);
        } catch (Exception e) {
            System.err.println("Failed to update mission progress: " + e.getMessage());
        }
        return result;
    }
}
