package com.example.football.service;

import com.example.football.entity.AiClub;
import com.example.football.entity.MatchFixture;
import com.example.football.entity.SquadFormation;
import com.example.football.entity.Users;
import com.example.football.entity.PlayerCard;
import com.example.football.repository.SquadFormationRepository;
import com.example.football.repository.PlayerCardRepository;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MatchSimulationEngine {

    private final Random random = new Random();
    private final SquadFormationRepository squadFormationRepository;
    private final PlayerCardRepository playerCardRepository;
    private final ObjectMapper objectMapper;

    public void simulateMatch(MatchFixture fixture) {
        int homeOvr = getHomeOvr(fixture);
        int awayOvr = getAwayOvr(fixture);

        int homeScore, awayScore;

        // Force loss if user has 0 OVR (incomplete squad)
        if (fixture.isHomeIsUser() && homeOvr == 0) {
            homeScore = 0;
            awayScore = 3;
        } else if (fixture.isAwayIsUser() && awayOvr == 0) {
            homeScore = 3;
            awayScore = 0;
        } else {
            // Simple probability based on OVR
            double homeWinProb = 0.5 + (homeOvr - awayOvr) * 0.02;
            homeWinProb = Math.max(0.1, Math.min(0.9, homeWinProb));

            double rand = random.nextDouble();
            if (rand < homeWinProb) {
                // Home wins or draws
                homeScore = random.nextInt(4);
                awayScore = random.nextInt(Math.max(1, homeScore + 1));
            } else {
                // Away wins
                awayScore = random.nextInt(4);
                homeScore = random.nextInt(Math.max(1, awayScore + 1));
            }
        }

        fixture.setHomeScore(homeScore);
        fixture.setAwayScore(awayScore);

        // Knockout Logic: Extra Time & Penalties if draw
        if (fixture.isKnockout() && homeScore == awayScore) {
            // Simulate Extra Time (Simplified: 50% chance of 1 more goal for one side)
            double etRand = random.nextDouble();
            if (etRand < 0.3) {
                fixture.setHomeScore(homeScore + 1);
                fixture.setExtraTimeUsed(true);
            } else if (etRand < 0.6) {
                fixture.setAwayScore(awayScore + 1);
                fixture.setExtraTimeUsed(true);
            } else {
                // Still draw after ET -> Penalties
                int homePen = 3 + random.nextInt(3); // 3-5
                int awayPen = 3 + random.nextInt(3);
                while (homePen == awayPen) {
                    awayPen = 3 + random.nextInt(3);
                }
                fixture.setHomePenaltyScore(homePen);
                fixture.setAwayPenaltyScore(awayPen);
                fixture.setExtraTimeUsed(true);
            }
        }

        fixture.setPlayed(true);

        // Check if user was eliminated (Knockout only)
        if (fixture.isKnockout()) {
            boolean userLost = false;
            if (fixture.isHomeIsUser()) {
                if (fixture.getHomeScore() < fixture.getAwayScore()) userLost = true;
                if (fixture.getHomePenaltyScore() != null && fixture.getHomePenaltyScore() < fixture.getAwayPenaltyScore()) userLost = true;
            } else if (fixture.isAwayIsUser()) {
                if (fixture.getAwayScore() < fixture.getHomeScore()) userLost = true;
                if (fixture.getAwayPenaltyScore() != null && fixture.getAwayPenaltyScore() < fixture.getHomePenaltyScore()) userLost = true;
            }

            if (userLost) {
                fixture.getTournament().setIsEliminated(true);
            }
        }
    }

    private int getHomeOvr(MatchFixture fixture) {
        if (fixture.isHomeIsUser()) {
            return calculateUserSquadOvr(fixture.getHomeUser());
        } else if (fixture.getHomeAiClub() != null) {
            return fixture.getHomeAiClub().getBaseOvr();
        }
        return 70;
    }

    private int getAwayOvr(MatchFixture fixture) {
        if (fixture.isAwayIsUser()) {
            return calculateUserSquadOvr(fixture.getAwayUser());
        } else if (fixture.getAwayAiClub() != null) {
            return fixture.getAwayAiClub().getBaseOvr();
        }
        return 70;
    }

    private int calculateUserSquadOvr(Users user) {
        // Must calculate from active squad. Fallback is removed to enforce 11-player rule.
        Optional<SquadFormation> squadOpt = squadFormationRepository.findByUser(user);
        if (squadOpt.isPresent() && squadOpt.get().getLineupJson() != null && !squadOpt.get().getLineupJson().isBlank()) {
            try {
                Map<String, Long> lineup = objectMapper.readValue(squadOpt.get().getLineupJson(), new TypeReference<Map<String, Long>>() {});
                
                // User must have exactly 11 players in lineup
                if (lineup.size() < 11) {
                    return 0; // Incomplete squad
                }

                List<PlayerCard> activeCards = playerCardRepository.findAllById(lineup.values());
                if (activeCards.size() == 11) {
                    double averageOvr = activeCards.stream()
                            .mapToInt(c -> c.getTemplate().getOvr() + c.getUpgradeLevel())
                            .average()
                            .orElse(0.0);
                    return (int) Math.round(averageOvr);
                }
            } catch (Exception e) {
                // Ignore and return 0
            }
        }

        return 0; // Squad not found or incomplete
    }
}
