package com.example.football.controller;

import com.example.football.entity.MissionType;
import com.example.football.service.MatchService;
import com.example.football.service.MissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gameplay")
@RequiredArgsConstructor
public class GameplayController {

    private final MatchService matchService;
    private final MissionService missionService;

    @PostMapping("/solo-match")
    public ResponseEntity<MatchService.MatchResult> simulateSolo(@RequestBody Map<String, Object> request) {
        String homeName = (String) request.getOrDefault("homeName", "My Team");
        int    homeOvr  = (int) request.getOrDefault("homeOvr", 80);
        String awayName = (String) request.getOrDefault("awayName", "Bot FC");
        int    awayOvr  = (int) request.getOrDefault("awayOvr", 85);

        MatchService.MatchResult result = matchService.simulateMatch(homeName, homeOvr, awayName, awayOvr);
        
        if (result.getHomeScore() > result.getAwayScore()) {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            missionService.updateProgress(username, MissionType.WIN_MATCH, 1);
        }

        return ResponseEntity.ok(result);
    }
}
