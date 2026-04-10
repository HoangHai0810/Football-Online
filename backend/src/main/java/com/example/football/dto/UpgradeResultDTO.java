package com.example.football.dto;

import com.example.football.entity.PlayerCard;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpgradeResultDTO {
    private boolean success;
    private PlayerCard card;
    private int originalLevel;
    private int intermediateLevel;
    private boolean criticalSuccess;
    private boolean hasJumpChance;
}
