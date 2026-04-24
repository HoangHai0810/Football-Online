package com.example.football.service;

import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class MatchService {

    private final Random random = new Random();

    @Data
    @Builder
    public static class MatchEvent {
        private int minute;
        private String description;
        private String team;
        private boolean isGoal;
    }

    @Data
    @Builder
    public static class MatchResult {
        private String homeTeam;
        private String awayTeam;
        private int homeScore;
        private int awayScore;
        private List<MatchEvent> commentary;
        private int homeShots;
        private int awayShots;
        private int homePossession;
    }

    public MatchResult simulateMatch(String homeName, int homeOvr, String awayName, int awayOvr) {
        List<MatchEvent> commentary = new ArrayList<>();
        int              homeScore  = 0;
        int              awayScore  = 0;
        int              homeShots  = 0;
        int              awayShots  = 0;

        double ovrDiff = homeOvr - awayOvr;
        
        for (int min = 1; min <= 90; min++) {
            double chance = random.nextDouble();
            if (chance < 0.08) {
                boolean isHomeEvent = random.nextDouble() < (0.5 + (ovrDiff / 200.0));
                String  team        = isHomeEvent ? homeName : awayName;
                
                if (isHomeEvent) homeShots++; else awayShots++;

                double goalChance = random.nextDouble();
                if (goalChance < 0.25) {
                    if (isHomeEvent) homeScore++; else awayScore++;
                    commentary.add(MatchEvent.builder()
                            .minute(min)
                            .team(team)
                            .description("GOAL! " + team + " scores a magnificent strike!")
                            .isGoal(true)
                            .build());
                } else if (goalChance < 0.6) {
                    commentary.add(MatchEvent.builder()
                            .minute(min)
                            .team(team)
                            .description(team + " creates a dangerous opportunity but the shot goes wide.")
                            .isGoal(false)
                            .build());
                } else {
                    commentary.add(MatchEvent.builder()
                            .minute(min)
                            .team(team)
                            .description("Great save! The keeper denies " + team + " from close range.")
                            .isGoal(false)
                            .build());
                }
            }
        }

        int homePossession = 50 + (int)(ovrDiff / 2.0) + (random.nextInt(10) - 5);
            homePossession = Math.max(30, Math.min(70, homePossession));

        return MatchResult.builder()
                .homeTeam(homeName)
                .awayTeam(awayName)
                .homeScore(homeScore)
                .awayScore(awayScore)
                .commentary(commentary)
                .homeShots(homeShots)
                .awayShots(awayShots)
                .homePossession(homePossession)
                .build();
    }
}
