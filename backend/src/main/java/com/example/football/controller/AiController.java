package com.example.football.controller;

import com.example.football.service.CareerService;
import com.example.football.service.MissionService;
import com.example.football.service.PlayerCardService;
import com.example.football.service.SquadService;
import com.example.football.entity.*;
import com.example.football.repository.UserRepository;
import com.example.football.repository.PlayerTemplateRepository;
import com.example.football.repository.SquadFormationRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai/v1")
@RequiredArgsConstructor
public class AiController {

    private final CareerService careerService;
    private final PlayerCardService playerCardService;
    private final MissionService missionService;
    private final SquadService squadService;
    private final UserRepository userRepository;
    private final PlayerTemplateRepository playerTemplateRepository;
    private final SquadFormationRepository squadRepo;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules();

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

        // 2. Full Player Collection (with effective OVR)
        List<PlayerCard> cards = playerCardService.getCardsByUserId(userId);
        List<Map<String, Object>> cardList = cards.stream().map(c -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", c.getId());
            m.put("name", c.getTemplate().getName());
            m.put("ovr", c.getEffectiveOvr());
            m.put("baseOvr", c.getTemplate().getOvr());
            m.put("level", c.getUpgradeLevel());
            m.put("position", c.getTemplate().getPosition());
            m.put("season", c.getTemplate().getSeason().name());
            return m;
        }).collect(Collectors.toList());
        context.put("allPlayerCards", cardList);

        // 3. Current Squad / Lineup
        Optional<SquadFormation> squadOpt = squadRepo.findByUser(user);
        if (squadOpt.isPresent()) {
            SquadFormation squad = squadOpt.get();
            context.put("currentFormation", squad.getFormation());
            try {
                Map<String, Long> lineup = objectMapper.readValue(squad.getLineupJson(), new TypeReference<Map<String, Long>>() {});
                Set<Long> starterIds = new HashSet<>(lineup.values());
                
                context.put("starters", cardList.stream().filter(c -> starterIds.contains(c.get("id"))).collect(Collectors.toList()));
                context.put("substitutes", cardList.stream().filter(c -> !starterIds.contains(c.get("id"))).collect(Collectors.toList()));
            } catch (Exception e) {
                context.put("lineupError", "Could not parse lineup");
            }
        }

        // 4. Market Suggestions (Affordable players)
        context.put("marketSuggestions", playerTemplateRepository.findAll().stream()
                .map(t -> {
                    int price = (int) (Math.pow(t.getOvr() - 70, 2) * 50 + 1000);
                    Map<String, Object> m = new HashMap<>();
                    m.put("template", t);
                    m.put("price", price);
                    return m;
                })
                .filter(m -> (int)m.get("price") <= user.getCoins()) // Filter by user's actual coins
                .sorted((a, b) -> ((PlayerTemplate)b.get("template")).getOvr() - ((PlayerTemplate)a.get("template")).getOvr())
                .limit(10)
                .map(m -> {
                    PlayerTemplate t = (PlayerTemplate)m.get("template");
                    return Map.of(
                        "name", t.getName(),
                        "ovr", t.getOvr(),
                        "position", t.getPosition(),
                        "price", m.get("price")
                    );
                }).collect(Collectors.toList()));

        // 5. Tournaments (Existing logic)
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

    @PostMapping("/optimize")
    public Map<String, Object> optimizeSquad() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return squadService.optimizeSquad(user);
    }
}
