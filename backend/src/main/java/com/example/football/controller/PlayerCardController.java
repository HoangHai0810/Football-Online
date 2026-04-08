package com.example.football.controller;

import com.example.football.entity.PlayerCard;
import com.example.football.service.PlayerCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlayerCardController {

    private final PlayerCardService playerCardService;

    @GetMapping("/user/{userId}")
    public List<PlayerCard> getCardsByUserId(@PathVariable Long userId) {
        return playerCardService.getCardsByUserId(userId);
    }

    @PostMapping("/open-pack")
    public PlayerCard openPack(@RequestParam Long userId) {
        return playerCardService.openRandomCardPack(userId);
    }

    @PostMapping("/upgrade")
    public PlayerCard upgradeCard(@RequestParam Long targetCardId, @RequestBody List<Long> materialCardIds) {
        return playerCardService.upgradeCard(targetCardId, materialCardIds);
    }
}
