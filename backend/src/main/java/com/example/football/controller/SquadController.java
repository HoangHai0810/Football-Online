package com.example.football.controller;

import com.example.football.entity.SquadFormation;
import com.example.football.repository.SquadFormationRepository;
import com.example.football.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/squad")
@RequiredArgsConstructor
public class SquadController {

    private final SquadFormationRepository squadRepo;
    private final UserRepository userRepo;

    @GetMapping
    public ResponseEntity<SquadResponse> getLineup() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username)
                .flatMap(user -> squadRepo.findByUser(user))
                .map(squad -> ResponseEntity.ok(new SquadResponse(squad.getLineupJson(), squad.getFormation())))
                .orElse(ResponseEntity.ok(new SquadResponse("{}", "4-3-3")));
    }

    @PostMapping
    public ResponseEntity<Void> saveLineup(@RequestBody LineupRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepo.findByUsername(username).ifPresent(user -> {
            SquadFormation squad = squadRepo.findByUser(user)
                    .orElse(SquadFormation.builder().user(user).build());
            squad.setLineupJson(request.getLineupJson());
            if (request.getFormation() != null) {
                squad.setFormation(request.getFormation());
            }
            squadRepo.save(squad);
        });
        return ResponseEntity.ok().build();
    }

    @Data
    public static class LineupRequest {
        private String lineupJson;
        private String formation;
    }

    @Data
    @AllArgsConstructor
    public static class SquadResponse {
        private String lineupJson;
        private String formation;
    }
}
