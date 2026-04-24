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
    private final com.example.football.repository.TournamentPlayerStatRepository playerStatRepository;
    private final ObjectMapper objectMapper;

    public void simulateMatch(MatchFixture fixture) {
        int homeOvr = getHomeOvr(fixture);
        int awayOvr = getAwayOvr(fixture);

        int homeScore, awayScore;

        if (fixture.isHomeIsUser() && homeOvr == 0) {
            homeScore = 0;
            awayScore = 3;
        } else if (fixture.isAwayIsUser() && awayOvr == 0) {
            homeScore = 3;
            awayScore = 0;
        } else {
            double homeWinProb = 0.5 + (homeOvr - awayOvr) * 0.02;
                   homeWinProb = Math.max(0.1, Math.min(0.9, homeWinProb));

            double rand = random.nextDouble();
            if (rand < homeWinProb) {
                homeScore = random.nextInt(4);
                awayScore = random.nextInt(Math.max(1, homeScore + 1));
            } else {
                awayScore = random.nextInt(4);
                homeScore = random.nextInt(Math.max(1, awayScore + 1));
            }
        }

        fixture.setHomeScore(homeScore);
        fixture.setAwayScore(awayScore);
        fixture.setPlayed(true);

        attributeStats(fixture, homeScore, awayScore);

        if (fixture.isKnockout() && homeScore == awayScore) {
            double etRand = random.nextDouble();
            if (etRand < 0.3) {
                fixture.setHomeScore(homeScore + 1);
                fixture.setExtraTimeUsed(true);
            } else if (etRand < 0.6) {
                fixture.setAwayScore(awayScore + 1);
                fixture.setExtraTimeUsed(true);
            } else {
                int homePen = 3 + random.nextInt(3);
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

        checkUserElimination(fixture);
    }

    public void applyUserInteractiveResult(MatchFixture fixture, int homeScore, int awayScore, Integer homePen, Integer awayPen) {
        fixture.setHomeScore(homeScore);
        fixture.setAwayScore(awayScore);
        if (homePen != null && awayPen != null) {
            fixture.setHomePenaltyScore(homePen);
            fixture.setAwayPenaltyScore(awayPen);
            fixture.setExtraTimeUsed(true);
        }
        fixture.setPlayed(true);
        
        attributeStats(fixture, homeScore, awayScore);
        
        checkUserElimination(fixture);
    }

    private void checkUserElimination(MatchFixture fixture) {
        if (fixture.isKnockout()) {
            boolean userLost = false;
            if (fixture.isHomeIsUser()) {
                if (fixture.getHomeScore() < fixture.getAwayScore()) userLost                                                        = true;
                if (fixture.getHomePenaltyScore() != null && fixture.getHomePenaltyScore() < fixture.getAwayPenaltyScore()) userLost = true;
            } else if (fixture.isAwayIsUser()) {
                if (fixture.getAwayScore() < fixture.getHomeScore()) userLost                                                        = true;
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
        Optional<SquadFormation> squadOpt = squadFormationRepository.findFirstByUserOrderByIdDesc(user);
        if (squadOpt.isPresent() && squadOpt.get().getLineupJson() != null && !squadOpt.get().getLineupJson().isBlank()) {
            try {
                Map<String, Long> lineup = objectMapper.readValue(squadOpt.get().getLineupJson(), new TypeReference<Map<String, Long>>() {});

                if (lineup.size() < 11) {
                    return 0;
                }

                String formation       = squadOpt.get().getFormation() != null ? squadOpt.get().getFormation() : "4-3-3";
                String[] slotPositions = getPositionsForFormation(formation);
                
                double totalEffOvr = 0;
                for (Map.Entry<String, Long> entry : lineup.entrySet()) {
                    int slotIdx = Integer.parseInt(entry.getKey());
                    if (slotIdx >= 0 && slotIdx < 11) {
                        Long                 cardId  = entry.getValue();
                        Optional<PlayerCard> cardOpt = playerCardRepository.findById(cardId);
                        if (cardOpt.isPresent()) {
                            PlayerCard card         = cardOpt.get();
                            String     slotPos      = slotPositions[slotIdx];
                                       totalEffOvr += calculateEffectiveOvr(card, slotPos);
                        }
                    }
                }
                return (int) Math.round(totalEffOvr / 11.0);
            } catch (Exception e) {
            }
        }

        return 0;
    }

    private void attributeStats(MatchFixture fixture, int homeGoals, int awayGoals) {
        if (homeGoals > 0) recordGoalsForSide(fixture, true, homeGoals);
        if (awayGoals > 0) recordGoalsForSide(fixture, false, awayGoals);
    }

    private void recordGoalsForSide(MatchFixture fixture, boolean isHome, int count) {
        String clubName = "Unknown";
        if (isHome) {
            if   (fixture.isHomeIsUser() && fixture.getHomeUser() != null) clubName = fixture.getHomeUser().getClubName();
            else if (fixture.getHomeAiClub() != null) clubName                      = fixture.getHomeAiClub().getName();
        } else {
            if   (fixture.isAwayIsUser() && fixture.getAwayUser() != null) clubName = fixture.getAwayUser().getClubName();
            else if (fixture.getAwayAiClub() != null) clubName                      = fixture.getAwayAiClub().getName();
        }
        
        boolean isUser = isHome ? fixture.isHomeIsUser() : fixture.isAwayIsUser();
        Users   user   = isHome ? fixture.getHomeUser() : fixture.getAwayUser();
        
          // Maps to track total goals/assists per entity (User cardId or AI name)
        java.util.Map<String, Integer> aiGoalMap     = new java.util.HashMap<>();
        java.util.Map<String, Integer> aiAssistMap   = new java.util.HashMap<>();
        java.util.Map<Long  , Integer> userGoalMap   = new java.util.HashMap<>();
        java.util.Map<Long  , Integer> userAssistMap = new java.util.HashMap<>();

        for (int i = 0; i < count; i++) {
            if (isUser && user != null) {
                Long scorerId = pickWeightedUserPlayer(user, true, null);
                if (scorerId != null) {
                    userGoalMap.put(scorerId, userGoalMap.getOrDefault(scorerId, 0) + 1);
                      // 80% chance of assist from someone else
                    if (random.nextDouble() < 0.8) {
                        Long assisterId = pickWeightedUserPlayer(user, false, scorerId);
                        if (assisterId != null) {
                            userAssistMap.put(assisterId, userAssistMap.getOrDefault(assisterId, 0) + 1);
                        }
                    }
                }
            } else {
                String aiScorer = pickWeightedAiPlayer(fixture, isHome, true, null);
                aiGoalMap.put(aiScorer, aiGoalMap.getOrDefault(aiScorer, 0) + 1);
                  // 80% chance of assist
                if (random.nextDouble() < 0.8) {
                    String aiAssister = pickWeightedAiPlayer(fixture, isHome, false, aiScorer);
                    aiAssistMap.put(aiAssister, aiAssistMap.getOrDefault(aiAssister, 0) + 1);
                }
            }
        }

          // Persist User Stats
        java.util.Set<Long> involvedUserCards = new java.util.HashSet<>(userGoalMap.keySet());
        involvedUserCards.addAll(userAssistMap.keySet());
        
        for (Long cardId : involvedUserCards) {
            PlayerCard card = playerCardRepository.findById(cardId).orElse(null);
            if (card != null) {
                com.example.football.entity.TournamentPlayerStat stat = playerStatRepository.findFirstByTournamentAndPlayerCardIdOrderByIdDesc(fixture.getTournament(), card.getId())
                    .orElse(com.example.football.entity.TournamentPlayerStat.builder()
                        .tournament(fixture.getTournament())
                        .playerCardId(card.getId())
                        .playerName(card.getTemplate().getName())
                        .clubName(user != null ? user.getClubName() : "Unknown")
                        .build());
                stat.setGoals(stat.getGoals() + userGoalMap.getOrDefault(cardId, 0));
                stat.setAssists(stat.getAssists() + userAssistMap.getOrDefault(cardId, 0));
                playerStatRepository.save(stat);
            }
        }

          // Persist AI Stats
        java.util.Set<String> involvedAiNames = new java.util.HashSet<>(aiGoalMap.keySet());
        involvedAiNames.addAll(aiAssistMap.keySet());
        
        for (String name : involvedAiNames) {
            com.example.football.entity.TournamentPlayerStat stat = playerStatRepository.findFirstByTournamentAndPlayerNameAndClubNameOrderByIdDesc(fixture.getTournament(), name, clubName)
                .orElse(com.example.football.entity.TournamentPlayerStat.builder()
                    .tournament(fixture.getTournament())
                    .playerName(name)
                    .clubName(clubName)
                    .build());
            stat.setGoals(stat.getGoals() + aiGoalMap.getOrDefault(name, 0));
            stat.setAssists(stat.getAssists() + aiAssistMap.getOrDefault(name, 0));
            playerStatRepository.save(stat);
        }
    }

    private Long pickWeightedUserPlayer(Users user, boolean isGoal, Long excludeId) {
        try {
            Optional<SquadFormation> squadOpt = squadFormationRepository.findFirstByUserOrderByIdDesc(user);
            if (squadOpt.isPresent()) {
                Map<String, Long> lineup   = objectMapper.readValue(squadOpt.get().getLineupJson(), new TypeReference<Map<String, Long>>() {});
                String     formation       = squadOpt.get().getFormation() != null ? squadOpt.get().getFormation() : "4-3-3";
                String    [] slotPositions = getPositionsForFormation(formation);

                double             totalWeight         = 0;
                java.util.Map<Long, Double> candidates = new java.util.HashMap<>();

                for (Map.Entry<String, Long> entry : lineup.entrySet()) {
                    int  slotIdx = Integer.parseInt(entry.getKey());
                    Long cardId  = entry.getValue();
                    if (slotIdx >= 0 && slotIdx < 11 && (excludeId == null || !cardId.equals(excludeId))) {
                        String pos    = slotPositions[slotIdx];
                        double weight = isGoal ? getScoringWeight(pos) : getAssistWeight(pos);
                        candidates.put(cardId, weight);
                        totalWeight += weight;
                    }
                }

                if (totalWeight <= 0) return null;

                double r          = random.nextDouble() * totalWeight;
                double cumulative = 0;
                for (Map.Entry<Long, Double> candidate : candidates.entrySet()) {
                    cumulative += candidate.getValue();
                    if (r <= cumulative) return candidate.getKey();
                }
            }
        } catch (Exception e) {}
        return null;
    }

    private String pickWeightedAiPlayer(MatchFixture fixture, boolean isHome, boolean isGoal, String excludeName) {
        AiClub club       = isHome ? fixture.getHomeAiClub() : fixture.getAwayAiClub();
        String clubSuffix = club != null ? " (" + club.getName() + ")" : "";
        
          // Define default roles with weights
        java.util.Map<String, Double> roles = new java.util.HashMap<>();
        if (isGoal) {
            roles.put("Striker", 10.0);
            roles.put("Winger", 4.0);
            roles.put("Midfielder", 1.5);
            roles.put("Defender", 0.1);
        } else {
            roles.put("Midfielder", 10.0);
            roles.put("Winger", 7.0);
            roles.put("Striker", 2.0);
            roles.put("Defender", 1.0);
        }

        if (club != null && club.getStarPlayers() != null && !club.getStarPlayers().isBlank()) {
            String[] stars = club.getStarPlayers().split(",\\s*");
              // If stars are available, we give them high weights
            double               totalWeight         = 0;
            java.util.Map<String, Double> candidates = new java.util.HashMap<>();
            for (String s : stars) {
                if (excludeName == null || !s.equals(excludeName)) {
                    double w = isGoal ? 5.0 : 3.0;  // Fixed high weight for "Star" names
                    candidates.put(s, w);
                    totalWeight += w;
                }
            }
            if (totalWeight > 0) {
                double r          = random.nextDouble() * totalWeight;
                double cumulative = 0;
                for (Map.Entry<String, Double> cand : candidates.entrySet()) {
                    cumulative += cand.getValue();
                    if (r <= cumulative) return cand.getKey();
                }
            }
        }
        
          // Fallback to position-based generic names if no stars or if we want variety
        List<String> roleKeys = new java.util.ArrayList<>(roles.keySet());
        roleKeys.remove(excludeName != null && excludeName.contains(" ") ? excludeName.split(" ")[0] : excludeName);
        
        double totalWeight                           = 0;
        for    (String role : roleKeys) totalWeight += roles.get(role);
        
        double r          = random.nextDouble() * totalWeight;
        double cumulative = 0;
        for (String role : roleKeys) {
            cumulative += roles.get(role);
            if (r <= cumulative) return role + clubSuffix;
        }
        
        return "Unknown Player" + clubSuffix;
    }

    private double getScoringWeight(String pos) {
        return switch (pos) {
            case "ST", "CF" -> 10.0;
            case "LW", "RW", "CAM" -> 4.0;
            case "LM", "RM", "CM" -> 1.5;
            case "LB", "RB", "CB", "LWB", "RWB", "CDM" -> 0.2;
            case "GK" -> 0.01;
            default -> 1.0;
        };
    }

    private double getAssistWeight(String pos) {
        return switch (pos) {
            case "CAM", "CM" -> 10.0;
            case "LW", "RW", "LM", "RM" -> 8.0;
            case "ST", "CF" -> 3.0;
            case "LB", "RB", "LWB", "RWB", "CDM" -> 1.5;
            case "CB" -> 0.5;
            case "GK" -> 0.05;
            default -> 1.0;
        };
    }

    private String[] getPositionsForFormation(String formation) {
        switch (formation) {
            case "4-4-2"    : return new String[]{"GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"};
            case "4-2-3-1"  : return new String[]{"GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "CAM", "LM", "RM", "ST"};
            case "3-5-2"    : return new String[]{"GK", "CB", "CB", "CB", "LWB", "CDM", "CDM", "RWB", "CAM", "ST", "ST"};
            case "4-1-2-1-2": return new String[]{"GK", "LB", "CB", "CB", "RB", "CDM", "LM", "RM", "CAM", "ST", "ST"};
            case "4-3-2-1"  : return new String[]{"GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "CAM", "CAM", "ST"};
            case "5-3-2"    : return new String[]{"GK", "LWB", "CB", "CB", "CB", "RWB", "CM", "CDM", "CM", "ST", "ST"};
            case "3-4-3"    : return new String[]{"GK", "CB", "CB", "CB", "LM", "CM", "CM", "RM", "LW", "ST", "RW"};
            case "4-5-1"    : return new String[]{"GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "CM", "RM", "ST"};
            case "4-3-3"    : 
                 default    : return new String[]{"GK", "LB", "CB", "CB", "RB", "CM", "CDM", "CM", "LW", "ST", "RW"};
        }
    }

    private int calculateEffectiveOvr(PlayerCard card, String slotPos) {
        int    baseOvr = card.getEffectiveOvr();
        String natPos  = card.getTemplate().getPosition().name();
        
        if (natPos.equals(slotPos)) return baseOvr;
        
        String natGroup  = getPosGroup(natPos);
        String slotGroup = getPosGroup(slotPos);
        
        if (natGroup.equals(slotGroup)) return Math.max(1, baseOvr - 3);
        if (natGroup.equals("GK") || slotGroup.equals("GK")) return Math.max(1, baseOvr - 20);
        return Math.max(1, baseOvr - 8);
    }

    private String getPosGroup(String pos) {
        if (pos.equals("GK")) return "GK";
        if (List.of("CB", "LB", "RB", "LWB", "RWB").contains(pos)) return "DEF";
        if (List.of("CDM", "CM", "CAM", "LM", "RM").contains(pos)) return "MID";
        return "FWD";
    }
}
