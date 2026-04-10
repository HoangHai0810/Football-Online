package com.example.football.service;

import com.example.football.entity.*;
import com.example.football.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CareerService {

    private final UserCareerRepository userCareerRepository;
    private final TournamentRepository tournamentRepository;
    private final TournamentStandingRepository standingRepository;
    private final MatchFixtureRepository fixtureRepository;
    private final SeasonGeneratorService seasonGeneratorService;
    private final MatchSimulationEngine matchSimulationEngine;
    private final UserRepository userRepository;
    private final TrophyRepository trophyRepository;

    public UserCareer getCareerByUserId(Long userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return userCareerRepository.findByUser(user)
                .orElseGet(() -> {
                    seasonGeneratorService.createNewSeason(user);
                    return userCareerRepository.findByUser(user).orElseThrow();
                });
    }

    public List<TournamentStanding> getStandings(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));
        return standingRepository.findByTournamentOrderByPointsDescGoalsForDesc(tournament);
    }

    public List<Tournament> getTournamentsByUserId(Long userId) {
        UserCareer career = getCareerByUserId(userId);
        return tournamentRepository.findByUserAndSeasonIndex(career.getUser(), career.getCurrentSeason());
    }

    public List<Trophy> getTrophies(Long userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return trophyRepository.findByUserOrderByWonAtDesc(user);
    }

    public List<MatchFixture> getFixturesByWeek(Long tournamentId, Integer week) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));
        return fixtureRepository.findByTournamentAndMatchWeek(tournament, week);
    }

    @Transactional
    public Map<String, Object> advanceWeek(Long userId) {
        UserCareer career = getCareerByUserId(userId);
        Tournament league = tournamentRepository.findByUserAndSeasonIndexAndType(career.getUser(), career.getCurrentSeason(), "LEAGUE")
                .get(0);

        List<MatchFixture> currentFixtures = fixtureRepository.findByTournamentAndMatchWeek(league, career.getCurrentWeek());
        
        for (MatchFixture fixture : currentFixtures) {
            if (!fixture.isPlayed()) {
                matchSimulationEngine.simulateMatch(fixture);
                updateStandings(fixture);
            }
        }
        fixtureRepository.saveAll(currentFixtures);

        // Advance career week
        career.setCurrentWeek(career.getCurrentWeek() + 1);
        if (career.getCurrentWeek() > 38) { // End of season
            awardTrophies(league, career.getUser(), career.getCurrentSeason());
            
            // Handle Promotion/Relegation
            List<TournamentStanding> standings = standingRepository.findByTournamentOrderByPointsDescGoalsForDesc(league);
            int userRank = -1;
            for (int i = 0; i < standings.size(); i++) {
                if (standings.get(i).isUserTeam()) {
                    userRank = i + 1;
                    break;
                }
            }

            if (userRank != -1) {
                if (userRank <= 3 && career.getCurrentTier() > 1) {
                    career.setCurrentTier(career.getCurrentTier() - 1); // Promote
                } else if (userRank >= 18 && career.getCurrentTier() < 3) {
                    career.setCurrentTier(career.getCurrentTier() + 1); // Relegate
                }
            }

            career.setCurrentWeek(1);
            career.setCurrentSeason(career.getCurrentSeason() + 1);
            // Trigger next season generation immediately
            seasonGeneratorService.createNewSeason(career.getUser());
        }
        userCareerRepository.save(career);

        return Map.of(
            "weekSimulated", career.getCurrentWeek() - 1,
            "fixtures", currentFixtures,
            "career", career
        );
    }

    private void updateStandings(MatchFixture fixture) {
        TournamentStanding homeStanding = findStanding(fixture.getTournament(), fixture.getHomeAiClub(), fixture.getHomeUser());
        TournamentStanding awayStanding = findStanding(fixture.getTournament(), fixture.getAwayAiClub(), fixture.getAwayUser());

        homeStanding.setPlayed(homeStanding.getPlayed() + 1);
        awayStanding.setPlayed(awayStanding.getPlayed() + 1);

        homeStanding.setGoalsFor(homeStanding.getGoalsFor() + fixture.getHomeScore());
        homeStanding.setGoalsAgainst(homeStanding.getGoalsAgainst() + fixture.getAwayScore());
        
        awayStanding.setGoalsFor(awayStanding.getGoalsFor() + fixture.getAwayScore());
        awayStanding.setGoalsAgainst(awayStanding.getGoalsAgainst() + fixture.getHomeScore());

        if (fixture.getHomeScore() > fixture.getAwayScore()) {
            homeStanding.setWon(homeStanding.getWon() + 1);
            homeStanding.setPoints(homeStanding.getPoints() + 3);
            awayStanding.setLost(awayStanding.getLost() + 1);
        } else if (fixture.getHomeScore() < fixture.getAwayScore()) {
            awayStanding.setWon(awayStanding.getWon() + 1);
            awayStanding.setPoints(awayStanding.getPoints() + 3);
            homeStanding.setLost(homeStanding.getLost() + 1);
        } else {
            homeStanding.setDrawn(homeStanding.getDrawn() + 1);
            homeStanding.setPoints(homeStanding.getPoints() + 1);
            awayStanding.setDrawn(awayStanding.getDrawn() + 1);
            awayStanding.setPoints(awayStanding.getPoints() + 1);
        }

        standingRepository.save(homeStanding);
        standingRepository.save(awayStanding);
    }

    private TournamentStanding findStanding(Tournament tournament, AiClub aiClub, Users user) {
        List<TournamentStanding> standings = standingRepository.findByTournamentOrderByPointsDescGoalsForDesc(tournament);
        if (user != null) {
            return standings.stream().filter(s -> s.isUserTeam()).findFirst().orElseThrow();
        } else {
            return standings.stream().filter(s -> s.getAiClub() != null && s.getAiClub().getId().equals(aiClub.getId())).findFirst().orElseThrow();
        }
    }

    private void awardTrophies(Tournament tournament, Users user, int seasonIndex) {
        List<TournamentStanding> standings = standingRepository.findByTournamentOrderByPointsDescGoalsForDesc(tournament);
        if (standings.isEmpty()) return;

        if (standings.get(0).isUserTeam()) {
            trophyRepository.save(Trophy.builder()
                .user(user)
                .tournamentName(tournament.getName())
                .seasonIndex(seasonIndex)
                .rank("WINNER")
                .build());
        } else if (standings.size() > 1 && standings.get(1).isUserTeam()) {
             trophyRepository.save(Trophy.builder()
                .user(user)
                .tournamentName(tournament.getName())
                .seasonIndex(seasonIndex)
                .rank("RUNNER_UP")
                .build());
        } else {
             boolean inTop4 = false;
             for (int i = 2; i < Math.min(4, standings.size()); i++) {
                 if (standings.get(i).isUserTeam()) inTop4 = true;
             }
             if (inTop4) {
                 trophyRepository.save(Trophy.builder()
                    .user(user)
                    .tournamentName(tournament.getName())
                    .seasonIndex(seasonIndex)
                    .rank("TOP_4")
                    .build());
             }
        }
    }
}
