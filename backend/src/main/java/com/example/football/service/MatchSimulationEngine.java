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
        Optional<SquadFormation> squadOpt = squadFormationRepository.findFirstByUserOrderByIdDesc(user);
        if (squadOpt.isPresent() && squadOpt.get().getLineupJson() != null && !squadOpt.get().getLineupJson().isBlank()) {
            try {
                Map<String, Long> lineup = objectMapper.readValue(squadOpt.get().getLineupJson(), new TypeReference<Map<String, Long>>() {});

                if (lineup.size() < 11) {
                    return 0;
                }

                String formation = squadOpt.get().getFormation() != null ? squadOpt.get().getFormation() : "4-3-3";
                String[] slotPositions = getPositionsForFormation(formation);
                
                double totalEffOvr = 0;
                for (Map.Entry<String, Long> entry : lineup.entrySet()) {
                    int slotIdx = Integer.parseInt(entry.getKey());
                    if (slotIdx >= 0 && slotIdx < 11) {
                        Long cardId = entry.getValue();
                        Optional<PlayerCard> cardOpt = playerCardRepository.findById(cardId);
                        if (cardOpt.isPresent()) {
                            PlayerCard card = cardOpt.get();
                            String slotPos = slotPositions[slotIdx];
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
            if (fixture.isHomeIsUser() && fixture.getHomeUser() != null) clubName = fixture.getHomeUser().getClubName();
            else if (fixture.getHomeAiClub() != null) clubName = fixture.getHomeAiClub().getName();
        } else {
            if (fixture.isAwayIsUser() && fixture.getAwayUser() != null) clubName = fixture.getAwayUser().getClubName();
            else if (fixture.getAwayAiClub() != null) clubName = fixture.getAwayAiClub().getName();
        }
        
        boolean isUser = isHome ? fixture.isHomeIsUser() : fixture.isAwayIsUser();
        Users user = isHome ? fixture.getHomeUser() : fixture.getAwayUser();
        
        java.util.Map<String, Integer> aiGoalMap = new java.util.HashMap<>();
        java.util.Map<Long, Integer> userGoalMap = new java.util.HashMap<>();

        for (int i = 0; i < count; i++) {
            if (isUser && user != null) {
                Long cardId = pickRandomUserScorer(user);
                if (cardId != null) userGoalMap.put(cardId, userGoalMap.getOrDefault(cardId, 0) + 1);
            } else {
                String aiName = pickRandomAiScorer(fixture, isHome);
                aiGoalMap.put(aiName, aiGoalMap.getOrDefault(aiName, 0) + 1);
            }
        }

        for (Map.Entry<Long, Integer> entry : userGoalMap.entrySet()) {
            Long cardId = entry.getKey();
            Integer goalsScored = entry.getValue();
            PlayerCard card = playerCardRepository.findById(cardId).orElse(null);
            if (card != null) {
                com.example.football.entity.TournamentPlayerStat stat = playerStatRepository.findFirstByTournamentAndPlayerCardIdOrderByIdDesc(fixture.getTournament(), card.getId())
                    .orElse(com.example.football.entity.TournamentPlayerStat.builder()
                        .tournament(fixture.getTournament())
                        .playerCardId(card.getId())
                        .playerName(card.getTemplate().getName())
                        .clubName(user.getClubName())
                        .build());
                stat.setGoals(stat.getGoals() + goalsScored);
                playerStatRepository.save(stat);
            }
        }

        for (Map.Entry<String, Integer> entry : aiGoalMap.entrySet()) {
            String name = entry.getKey();
            Integer goalsScored = entry.getValue();
            com.example.football.entity.TournamentPlayerStat stat = playerStatRepository.findFirstByTournamentAndPlayerNameAndClubNameOrderByIdDesc(fixture.getTournament(), name, clubName)
                .orElse(com.example.football.entity.TournamentPlayerStat.builder()
                    .tournament(fixture.getTournament())
                    .playerName(name)
                    .clubName(clubName)
                    .build());
            stat.setGoals(stat.getGoals() + goalsScored);
            playerStatRepository.save(stat);
        }
    }

    private Long pickRandomUserScorer(Users user) {
        try {
            Optional<SquadFormation> squadOpt = squadFormationRepository.findFirstByUserOrderByIdDesc(user);
            if (squadOpt.isPresent()) {
                Map<String, Long> lineup = objectMapper.readValue(squadOpt.get().getLineupJson(), new TypeReference<Map<String, Long>>() {});
                List<Long> possibleIds = List.copyOf(lineup.values());
                if (!possibleIds.isEmpty()) {
                    return possibleIds.get(random.nextInt(possibleIds.size()));
                }
            }
        } catch (Exception e) {}
        return null;
    }

    private String pickRandomAiScorer(MatchFixture fixture, boolean isHome) {
        String[] stars = {"Striker", "Winger", "Midfielder"}; 
        AiClub club = isHome ? fixture.getHomeAiClub() : fixture.getAwayAiClub();
        if (club != null && club.getStarPlayers() != null && !club.getStarPlayers().isBlank()) {
            stars = club.getStarPlayers().split(",\\s*");
        }
        return stars[random.nextInt(stars.length)];
    }

    private String[] getPositionsForFormation(String formation) {
        switch (formation) {
            case "4-4-2": return new String[]{"GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"};
            case "4-2-3-1": return new String[]{"GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "CAM", "LM", "RM", "ST"};
            case "3-5-2": return new String[]{"GK", "CB", "CB", "CB", "LWB", "CDM", "CDM", "RWB", "CAM", "ST", "ST"};
            case "4-1-2-1-2": return new String[]{"GK", "LB", "CB", "CB", "RB", "CDM", "LM", "RM", "CAM", "ST", "ST"};
            case "4-3-2-1": return new String[]{"GK", "LB", "CB", "CB", "RB", "CM", "CM", "CM", "CAM", "CAM", "ST"};
            case "5-3-2": return new String[]{"GK", "LWB", "CB", "CB", "CB", "RWB", "CM", "CDM", "CM", "ST", "ST"};
            case "3-4-3": return new String[]{"GK", "CB", "CB", "CB", "LM", "CM", "CM", "RM", "LW", "ST", "RW"};
            case "4-5-1": return new String[]{"GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "CM", "RM", "ST"};
            case "4-3-3":
            default: return new String[]{"GK", "LB", "CB", "CB", "RB", "CM", "CDM", "CM", "LW", "ST", "RW"};
        }
    }

    private int calculateEffectiveOvr(PlayerCard card, String slotPos) {
        int baseOvr = card.getEffectiveOvr();
        String natPos = card.getTemplate().getPosition().name();
        
        if (natPos.equals(slotPos)) return baseOvr;
        
        String natGroup = getPosGroup(natPos);
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
