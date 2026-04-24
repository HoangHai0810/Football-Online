package com.example.football.controller;

import com.example.football.dto.UserDTO;
import com.example.football.dto.UserStatsDTO;
import com.example.football.entity.PlayerCard;
import com.example.football.entity.Tournament;
import com.example.football.entity.TournamentStanding;
import com.example.football.entity.Users;
import com.example.football.entity.SquadFormation;
import com.example.football.repository.PlayerCardRepository;
import com.example.football.repository.SquadFormationRepository;
import com.example.football.repository.UserRepository;
import com.example.football.service.CareerService;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
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
    public ResponseEntity<UserDTO> getMe(Authentication authentication) {
        if (authentication == null) {
            log.warn("getMe called with null authentication");
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();
        log.info("getMe principal type: {}", principal.getClass().getName());

        Users user = null;
        if (principal instanceof Users) {
            user = (Users) principal;
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
                   user     = userRepository.findByUsername(username).orElse(null);
        }

        if (user == null) {
            log.warn("getMe user not found for principal: {}", principal);
            return ResponseEntity.status(401).build();
        }
        
        return ResponseEntity.ok(UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .coins(user.getCoins())
                .role(user.getRole())
                .clubName(user.getClubName())
                .build());
    }

    @PatchMapping("/club")
    public ResponseEntity<?> updateClubName(@RequestBody Map<String, String> body) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String newName  = body.get("clubName");
        if (newName == null || newName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Club name cannot be empty"));
        }
        return userRepository.findByUsername(username).map(user -> {
            user.setClubName(newName.trim().toUpperCase());
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("clubName", user.getClubName()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/topup")
    public ResponseEntity<?> topupCoins(@RequestParam long amount) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (amount <= 0 || amount > 100_000_000L) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid amount"));
        }
        return userRepository.findByUsername(username).map(user -> {
            user.setCoins(user.getCoins() + amount);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                "message", "Successfully topped up!",
                "newBalance", user.getCoins()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getStats() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    List<PlayerCard> cards   = playerCardRepository.findByOwner(user);
                    int              teamOvr = 0;
                    
                    Optional<SquadFormation> squadOpt = squadFormationRepository.findFirstByUserOrderByIdDesc(user);
                    if (squadOpt.isPresent()) {
                        SquadFormation squad = squadOpt.get();
                        if (squad.getLineupJson() != null && !squad.getLineupJson().isBlank()) {
                            try {
                                Map<String, Long> lineup        = objectMapper.readValue(squad.getLineupJson(), new TypeReference<Map<String, Long>>() {});
                                String            formation     = squad.getFormation() != null ? squad.getFormation() : "4-3-3";
                                String[]          slotPositions = getPositionsForFormation(formation);
                                
                                double totalEffOvr = 0;
                                for (Map.Entry<String, Long> entry : lineup.entrySet()) {
                                    int slotIdx = Integer.parseInt(entry.getKey());
                                    if (slotIdx >= 0 && slotIdx < 11) {
                                        Optional<PlayerCard> cardOpt = playerCardRepository.findById(entry.getValue());
                                        if (cardOpt.isPresent()) {
                                            PlayerCard card         = cardOpt.get();
                                            String     slotPos      = slotPositions[slotIdx];
                                                       totalEffOvr += calculateEffectiveOvr(card, slotPos);
                                        }
                                    }
                                }
                                teamOvr = (int) Math.round(totalEffOvr / 11.0);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    }

                    String rankStr = "#--";
                    try {
                        List<Tournament> tournaments = careerService.getTournamentsByUserId(user.getId());
                        if (!tournaments.isEmpty()) {
                            Tournament               league    = tournaments.stream().filter(t -> "LEAGUE".equals(t.getType())).findFirst().orElse(tournaments.get(0));
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
