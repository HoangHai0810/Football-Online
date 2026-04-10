package com.example.football.controller;

import com.example.football.dto.UserDTO;
import com.example.football.dto.UserStatsDTO;
import com.example.football.entity.PlayerCard;
import com.example.football.entity.Tournament;
import com.example.football.entity.TournamentStanding;
import com.example.football.repository.PlayerCardRepository;
import com.example.football.repository.SquadFormationRepository;
import com.example.football.repository.UserRepository;
import com.example.football.service.CareerService;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.example.football.entity.SquadFormation;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PlayerCardRepository playerCardRepository;
    private final SquadFormationRepository squadFormationRepository;
    private final CareerService careerService;
    private final ObjectMapper objectMapper;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok(UserDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .coins(user.getCoins())
                        .role(user.getRole())
                        .clubName(user.getClubName())
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/club")
    public ResponseEntity<?> updateClubName(@RequestBody Map<String, String> body) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String newName = body.get("clubName");
        if (newName == null || newName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Club name cannot be empty"));
        }
        return userRepository.findByUsername(username).map(user -> {
            user.setClubName(newName.trim().toUpperCase());
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("clubName", user.getClubName()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getStats() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    List<PlayerCard> cards = playerCardRepository.findByOwner(user);
                    int teamOvr = 0;
                    
                    Optional<SquadFormation> squadOpt = squadFormationRepository.findByUser(user);
                    if (squadOpt.isPresent() && squadOpt.get().getLineupJson() != null && !squadOpt.get().getLineupJson().isBlank()) {
                        try {
                            Map<String, Long> lineup = objectMapper.readValue(squadOpt.get().getLineupJson(), new TypeReference<Map<String, Long>>() {});
                            if (lineup.size() == 11) {
                                List<PlayerCard> activeCards = playerCardRepository.findAllById(lineup.values());
                                if (activeCards.size() == 11) {
                                    double avg = activeCards.stream()
                                            .mapToInt(c -> c.getTemplate().getOvr() + c.getUpgradeLevel())
                                            .average().orElse(0);
                                    teamOvr = (int) Math.round(avg);
                                }
                            }
                        } catch (Exception e) {}
                    }

                    String rankStr = "#--";
                    try {
                        List<Tournament> tournaments = careerService.getTournamentsByUserId(user.getId());
                        if (!tournaments.isEmpty()) {
                            Tournament league = tournaments.stream().filter(t -> "LEAGUE".equals(t.getType())).findFirst().orElse(tournaments.get(0));
                            List<TournamentStanding> standings = careerService.getStandings(league.getId());
                            for (int i = 0; i < standings.size(); i++) {
                                if (standings.get(i).isUserTeam()) {
                                    rankStr = "#" + (i + 1);
                                    break;
                                }
                            }
                        }
                    } catch (Exception e) {}

                    return ResponseEntity.ok(UserStatsDTO.builder()
                            .coins(user.getCoins())
                            .totalCards(cards.size())
                            .teamOvr(teamOvr)
                            .rank(rankStr)
                            .build());
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
