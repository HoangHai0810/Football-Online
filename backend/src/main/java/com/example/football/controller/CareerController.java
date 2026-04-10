package com.example.football.controller;

import com.example.football.entity.MatchFixture;
import com.example.football.entity.Tournament;
import com.example.football.entity.TournamentStanding;
import com.example.football.entity.Trophy;
import com.example.football.entity.UserCareer;
import com.example.football.service.CareerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/career")
@RequiredArgsConstructor
public class CareerController {

    private final CareerService careerService;

    @GetMapping("/state")
    public UserCareer getCareerState(@RequestParam Long userId) {
        return careerService.getCareerByUserId(userId);
    }

    @GetMapping("/tournaments")
    public List<Tournament> getTournaments(@RequestParam Long userId) {
        return careerService.getTournamentsByUserId(userId);
    }

    @GetMapping("/trophies")
    public List<Trophy> getTrophies(@RequestParam Long userId) {
        return careerService.getTrophies(userId);
    }

    @GetMapping("/standings/{tournamentId}")
    public List<TournamentStanding> getStandings(@PathVariable Long tournamentId) {
        return careerService.getStandings(tournamentId);
    }

    @GetMapping("/fixtures/{tournamentId}/{week}")
    public List<MatchFixture> getFixtures(@PathVariable Long tournamentId, @PathVariable Integer week) {
        return careerService.getFixturesByWeek(tournamentId, week);
    }

    @PostMapping("/advance")
    public Map<String, Object> advanceWeek(@RequestParam Long userId) {
        return careerService.advanceWeek(userId);
    }
}
