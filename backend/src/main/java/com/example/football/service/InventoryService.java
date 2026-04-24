package com.example.football.service;

import com.example.football.entity.InventoryPack;
import com.example.football.entity.PlayerCard;
import com.example.football.entity.Users;
import com.example.football.repository.InventoryPackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryPackRepository inventoryPackRepository;
    private final PlayerCardService playerCardService;

    @Transactional(readOnly = true)
    public List<InventoryPack> getInventory(Users user) {
        return inventoryPackRepository.findByUser(user);
    }

    @Transactional
    public void addPack(Users user, String packId, int quantity) {
        Optional<InventoryPack> existing = inventoryPackRepository.findByUserAndPackId(user, packId);
        if (existing.isPresent()) {
            InventoryPack pack = existing.get();
            pack.setQuantity(pack.getQuantity() + quantity);
            inventoryPackRepository.save(pack);
        } else {
            InventoryPack pack = InventoryPack.builder()
                    .user(user)
                    .packId(packId)
                    .quantity(quantity)
                    .build();
            inventoryPackRepository.save(pack);
        }
    }

    @Transactional
    public List<PlayerCard> openPacksFromInventory(Users user, String packId, int quantity) {
        InventoryPack pack = inventoryPackRepository.findByUserAndPackId(user, packId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "You don't have this pack in your inventory."));
        
        if (pack.getQuantity() < quantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough packs in inventory.");
        }

        pack.setQuantity(pack.getQuantity() - quantity);
        if (pack.getQuantity() <= 0) {
            inventoryPackRepository.delete(pack);
        } else {
            inventoryPackRepository.save(pack);
        }

        List<PlayerCard> results = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            results.add(playerCardService.openPackById(user, packId));
        }

        return results;
    }
}
