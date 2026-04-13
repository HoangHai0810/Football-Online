package com.example.football.controller;

import com.example.football.service.CareerService;
import com.example.football.service.MissionService;
import com.example.football.service.PlayerCardService;
import com.example.football.entity.*;
import com.example.football.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai/v1")
@RequiredArgsConstructor
public class AiController {

    private final CareerService careerService;
    private final PlayerCardService playerCardService;
    private final MissionService missionService;
    private final UserRepository userRepository;

    @GetMapping("/context")
    public Map<String, Object> getAiContext() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Long userId = user.getId();

        Map<String, Object> context = new HashMap<>();

        // 1. User and Career
        UserCareer career = careerService.getCareerByUserId(userId);
        context.put("user", Map.of(
                "username", username,
                "coins", user.getCoins(),
                "tier", career.getCurrentTier(),
                "week", career.getCurrentWeek(),
                "season", career.getCurrentSeason()
        ));

        // 2. Squad
        List<PlayerCard> cards = playerCardService.getCardsByUserId(userId);
        context.put("squad", cards.stream().map(c -> Map.of(
                "name", c.getTemplate().getName(),
                "ovr", c.getTemplate().getOvr(),
                "level", c.getUpgradeLevel(),
                "position", c.getTemplate().getPosition(),
                "season", c.getTemplate().getSeason().name()
        )).collect(Collectors.toList()));

        // 3. Tournaments
        List<Tournament> tournaments = careerService.getTournamentsByUserId(userId);
        context.put("tournaments", tournaments.stream().map(t -> {
            List<TournamentStanding> standings = careerService.getStandings(t.getId());
            return Map.of(
                    "name", t.getName(),
                    "type", t.getType(),
                    "standings", standings.stream()
                            .filter(s -> s.isUserTeam() || standings.indexOf(s) < 3) // Top 3 + user
                            .map(s -> Map.of(
                                    "team", s.isUserTeam() ? username : (s.getAiClub() != null ? s.getAiClub().getName() : "Unknown"),
                                    "rank", standings.indexOf(s) + 1,
                                    "points", s.getPoints(),
                                    "isUser", s.isUserTeam()
                            )).collect(Collectors.toList())
            );
        }).collect(Collectors.toList()));

        // 4. Missions
        List<UserMission> missions = missionService.getActiveMissionsForUser(username);
        context.put("missions", missions.stream()
                .filter(m -> !m.isCompleted())
                .map(m -> Map.of(
                        "description", m.getMission().getDescription(),
                        "progress", m.getCurrentAmount(),
                        "target", m.getMission().getTargetAmount()
                )).collect(Collectors.toList()));

        return context;
    }
}
