package com.example.football.controller;

import com.example.football.entity.UserMission;
import com.example.football.service.MissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @GetMapping
    public ResponseEntity<List<UserMission>> getMyMissions() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(missionService.getActiveMissionsForUser(username));
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<?> claimReward(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Long reward = missionService.claimReward(username, id);
            return ResponseEntity.ok(Map.of("message", "Success", "reward", reward));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/swap")
    public ResponseEntity<?> swapMission(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            UserMission newUm = missionService.swapMission(username, id);
            return ResponseEntity.ok(newUm);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
