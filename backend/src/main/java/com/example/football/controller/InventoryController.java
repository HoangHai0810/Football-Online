package com.example.football.controller;

import com.example.football.entity.InventoryPack;
import com.example.football.entity.PlayerCard;
import com.example.football.entity.Users;
import com.example.football.repository.UserRepository;
import com.example.football.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    private Users getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<InventoryPack>> getInventory() {
        return ResponseEntity.ok(inventoryService.getInventory(getAuthenticatedUser()));
    }

    @PostMapping("/open")
    public ResponseEntity<?> openPackFromInventory(
            @RequestParam String packId,
            @RequestParam(defaultValue = "1") int quantity) {
        try {
            Users            user  = getAuthenticatedUser();
            List<PlayerCard> cards = inventoryService.openPacksFromInventory(user, packId, quantity);
            return ResponseEntity.ok(cards);  // Return as List<PlayerCard> to mimic /open-packs-multi
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
