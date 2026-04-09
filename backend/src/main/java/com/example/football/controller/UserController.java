package com.example.football.controller;

import com.example.football.dto.UserDTO;
import com.example.football.dto.UserStatsDTO;
import com.example.football.entity.PlayerCard;
import com.example.football.repository.PlayerCardRepository;
import com.example.football.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PlayerCardRepository playerCardRepository;

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
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getStats() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    List<PlayerCard> cards = playerCardRepository.findByOwner(user);
                    
                    // Calculate Team OVR from top 11 cards
                    int teamOvr = cards.stream()
                            .map(c -> c.getTemplate().getOvr() + c.getUpgradeLevel())
                            .sorted(Comparator.reverseOrder())
                            .limit(11)
                            .mapToInt(Integer::intValue)
                            .average()
                            .isPresent() ? (int) cards.stream()
                                .map(c -> c.getTemplate().getOvr() + c.getUpgradeLevel())
                                .sorted(Comparator.reverseOrder())
                                .limit(11)
                                .mapToInt(Integer::intValue)
                                .average().getAsDouble() : 0;

                    return ResponseEntity.ok(UserStatsDTO.builder()
                            .coins(user.getCoins())
                            .totalCards(cards.size())
                            .teamOvr(teamOvr)
                            .rank("#" + (100 - (teamOvr / 2) + (int)(Math.random() * 5))) // Mock rank logic
                            .build());
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
