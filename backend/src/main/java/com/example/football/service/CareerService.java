package com.example.football.service;

import com.example.football.entity.*;
import com.example.football.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
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
    private final TournamentPlayerStatRepository playerStatRepository;

    @Transactional
    public UserCareer getCareerByUserId(Long userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return userCareerRepository.findByUser(user)
                .orElseGet(() -> {
                    return userCareerRepository.findByUser(user)
                            .orElseGet(() -> {
                                seasonGeneratorService.createNewSeason(user);
                                return userCareerRepository.findByUser(user).orElseThrow();
                            });
                });
    }

    @Transactional(readOnly = true)
    public List<TournamentStanding> getStandings(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));
        return standingRepository.findByTournamentOrderByPointsDescGoalsForDesc(tournament);
    }

    @Transactional
    public List<Tournament> getTournamentsByUserId(Long userId) {
        UserCareer career = getCareerByUserId(userId);
        return tournamentRepository.findByUserAndSeasonIndex(career.getUser(), career.getCurrentSeason());
    }

    @Transactional(readOnly = true)
    public List<Trophy> getTrophies(Long userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return trophyRepository.findByUserOrderByWonAtDesc(user);
    }

    @Transactional(readOnly = true)
    public List<MatchFixture> getFixturesByWeek(Long tournamentId, Integer week) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));
        return fixtureRepository.findByTournamentAndMatchWeek(tournament, week);
    }

    @Transactional(readOnly = true)
    public List<MatchFixture> getAllFixturesByTournament(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));
        return fixtureRepository.findByTournament(tournament);
    }

    @Transactional(readOnly = true)
    public List<TournamentPlayerStat> getTopScorers(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));
        return playerStatRepository.findByTournamentOrderByGoalsDescAssistsDesc(tournament).stream().limit(10).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TournamentPlayerStat> getTopAssists(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));
        return playerStatRepository.findByTournamentOrderByAssistsDescGoalsDesc(tournament).stream().limit(10).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> advanceWeek(Long userId, Integer userHomeScore, Integer userAwayScore, Integer homePen, Integer awayPen, Long fixtureId) {
        UserCareer career = getCareerByUserId(userId);
        List<Tournament> activeTournaments = tournamentRepository.findByUserAndSeasonIndex(career.getUser(), career.getCurrentSeason());

        // Find the specific fixture being played
        MatchFixture targetFixture = null;
        if (fixtureId != null) {
            targetFixture = fixtureRepository.findById(fixtureId).orElse(null);
        } else {
            // Fallback: find any unplayed user match in the current week
            targetFixture = fixtureRepository.findByTournamentInAndMatchWeek(activeTournaments, career.getCurrentWeek())
                    .stream()
                    .filter(f -> (f.isHomeIsUser() || f.isAwayIsUser()) && !f.isPlayed())
                    .findFirst()
                    .orElse(null);
        }

        if (targetFixture != null && !targetFixture.isPlayed()) {
            if (userHomeScore != null && userAwayScore != null) {
                matchSimulationEngine.applyUserInteractiveResult(targetFixture, userHomeScore, userAwayScore, homePen, awayPen);
            } else {
                matchSimulationEngine.simulateMatch(targetFixture);
            }
            if (!targetFixture.isKnockout()) {
                updateStandings(targetFixture);
            }
            fixtureRepository.save(targetFixture);
        }

        // Simulate ALL AI matches for the current WEEK in ALL active tournaments
        List<MatchFixture> allCurrentFixtures = fixtureRepository.findByTournamentInAndMatchWeek(activeTournaments, career.getCurrentWeek());
        for (MatchFixture f : allCurrentFixtures) {
            if (!f.isPlayed() && !f.isHomeIsUser() && !f.isAwayIsUser()) {
                matchSimulationEngine.simulateMatch(f);
                if (!f.isKnockout()) updateStandings(f);
                fixtureRepository.save(f);
            }
        }

        // Process Knockout Advancement if any round is finished
        for (Tournament t : activeTournaments) {
            if (t.getType().equals("CUP") || t.getType().equals("CONTINENTAL") || t.getType().equals("SUPER_CUP")) {
                processKnockoutAdvancement(t, career.getCurrentWeek());
            }
        }

        // Logic check: Advance global week ONLY if user has no unplayed fixtures left in THIS week
        boolean hasMoreUserMatchesThisWeek = fixtureRepository.findByTournamentInAndMatchWeek(activeTournaments, career.getCurrentWeek())
                .stream().anyMatch(f -> (f.isHomeIsUser() || f.isAwayIsUser()) && !f.isPlayed());

        Map<String, Object> seasonSummary = null;

        if (!hasMoreUserMatchesThisWeek) {
            career.setCurrentWeek(career.getCurrentWeek() + 1);
            
            if (career.getCurrentWeek() > 38) { // End of season
                seasonSummary = generateSeasonSummary(activeTournaments, career.getUser());
                
                for (Tournament t : activeTournaments) {
                    awardTournamentRewards(t, career.getUser());
                    if (t.getType().equals("LEAGUE")) {
                        handleLeaguePromotionAndRelegation(t, career);
                    }
                    t.setIsCompleted(true);
                }
                tournamentRepository.saveAll(activeTournaments);

                career.setCurrentWeek(1);
                career.setCurrentSeason(career.getCurrentSeason() + 1);
                seasonGeneratorService.createNewSeason(career.getUser());
            }
            userCareerRepository.save(career);
        }

        return Map.of(
            "weekSimulated", hasMoreUserMatchesThisWeek ? career.getCurrentWeek() : career.getCurrentWeek() - 1,
            "fixtures", allCurrentFixtures,
            "career", career,
            "seasonSummary", seasonSummary != null ? seasonSummary : Map.of()
        );
    }

    private Map<String, Object> generateSeasonSummary(List<Tournament> tournaments, Users user) {
        List<Map<String, Object>> tournamentResults = new ArrayList<>();
        long totalCoinsAwarded = 0;
        
        for (Tournament t : tournaments) {
            List<TournamentStanding> stds = standingRepository.findByTournamentOrderByPointsDescGoalsForDesc(t);
            int rank = -1;
            for (int i = 0; i < stds.size(); i++) {
                if (stds.get(i).isUserTeam()) { rank = i + 1; break; }
            }
            
            tournamentResults.add(Map.of(
                "name", t.getName(),
                "rank", rank,
                "type", t.getType()
            ));
        }
        
        return Map.of(
            "season", tournaments.get(0).getSeasonIndex(),
            "results", tournamentResults
        );
    }

    @Transactional
    public MatchFixture getNextUserFixture(Long userId) {
        UserCareer career = getCareerByUserId(userId);
        List<Tournament> activeTournaments = tournamentRepository.findByUserAndSeasonIndex(career.getUser(), career.getCurrentSeason());
        if (activeTournaments == null || activeTournaments.isEmpty()) {
            return null;
        }

        // Strategy: First unplayed user fixture in current week or future weeks
        return fixtureRepository.findByTournamentIn(activeTournaments).stream()
                .filter(f -> (f.isHomeIsUser() || f.isAwayIsUser()) && !f.isPlayed())
                .sorted((a, b) -> {
                    if (a.getMatchWeek() == null || b.getMatchWeek() == null) return 0;
                    if (!a.getMatchWeek().equals(b.getMatchWeek())) {
                        return a.getMatchWeek() - b.getMatchWeek();
                    }
                    if (a.getTournament() == null || b.getTournament() == null) return 0;
                    if (a.getTournament().getType() == null || b.getTournament().getType() == null) return 0;
                    return a.getTournament().getType().compareTo(b.getTournament().getType());
                })
                .findFirst()
                .orElse(null);
    }

    private void processKnockoutAdvancement(Tournament tournament, int currentWeek) {
        // Defined weeks for rounds: 2 (R16), 12 (Quarter), 22 (Semi), 32 (Final)
        int nextWeek;
        if (currentWeek == 2) nextWeek = 12;
        else if (currentWeek == 12) nextWeek = 22;
        else if (currentWeek == 22) nextWeek = 32;
        else return; // Not a knockout advancement week or already Final

        List<MatchFixture> currentFixtures = fixtureRepository.findByTournamentAndMatchWeek(tournament, currentWeek);
        if (currentFixtures.isEmpty()) return;

        // Ensure all matches in the current round are played
        boolean allPlayed = currentFixtures.stream().allMatch(MatchFixture::isPlayed);
        if (!allPlayed) return;

        // Collect winners
        List<Object> winners = new ArrayList<>();
        for (MatchFixture f : currentFixtures) {
            if (f.isUserWinner()) {
                winners.add(tournament.getUser());
            } else {
                AiClub winnerAi = f.getWinnerAiClub();
                if (winnerAi != null) winners.add(winnerAi);
            }
        }

        // Shuffle and pair for next round
        java.util.Collections.shuffle(winners);
        for (int i = 0; i < winners.size(); i += 2) {
            if (i + 1 < winners.size()) {
                saveFixture(tournament, nextWeek, winners.get(i), winners.get(i+1), true);
            }
        }
    }

    private void saveFixture(Tournament tournament, int week, Object home, Object away, boolean isKnockout) {
        MatchFixture fixture = MatchFixture.builder()
                .tournament(tournament).matchWeek(week).isKnockout(isKnockout)
                .homeUser(home instanceof Users ? (Users) home : null)
                .homeAiClub(home instanceof AiClub ? (AiClub) home : null)
                .homeIsUser(home instanceof Users)
                .awayUser(away instanceof Users ? (Users) away : null)
                .awayAiClub(away instanceof AiClub ? (AiClub) away : null)
                .awayIsUser(away instanceof Users)
                .build();
        fixtureRepository.save(fixture);
    }

    private void awardTournamentRewards(Tournament tournament, Users user) {
        long rewardAmount = 0;
        String reason = "Tournament Reward: " + tournament.getName();

        if (tournament.getType().equals("LEAGUE")) {
            List<TournamentStanding> standings = standingRepository.findByTournamentOrderByPointsDescGoalsForDesc(tournament);
            for (int i = 0; i < standings.size(); i++) {
                if (standings.get(i).isUserTeam()) {
                    int rank = i + 1;
                    if (rank == 1) rewardAmount = 500000;
                    else if (rank == 2) rewardAmount = 200000;
                    else if (rank <= 4) rewardAmount = 100000;
                    else if (rank <= 10) rewardAmount = 50000;
                    reason += " (Rank " + rank + ")";
                    break;
                }
            }
        } else {
            // Knockout Reward based on furthest round reached
            List<MatchFixture> userFixtures = fixtureRepository.findByTournament(tournament).stream()
                    .filter(f -> f.isHomeIsUser() || f.isAwayIsUser())
                    .sorted((a,b) -> b.getMatchWeek() - a.getMatchWeek())
                    .toList();

            if (!userFixtures.isEmpty()) {
                MatchFixture lastMatch = userFixtures.get(0);
                boolean wonLast = lastMatch.isUserWinner();
                
                if (lastMatch.getMatchWeek() == 32) { // Final
                    if (wonLast) {
                        rewardAmount = tournament.getType().equals("CONTINENTAL") ? 1000000 : 300000;
                        reason += " (WINNER)";
                    } else {
                        rewardAmount = tournament.getType().equals("CONTINENTAL") ? 400000 : 100000;
                        reason += " (RUNNER-UP)";
                    }
                } else if (lastMatch.getMatchWeek() == 22 && wonLast) { /* Handled in Final */ }
                else if (lastMatch.getMatchWeek() == 22) { rewardAmount = 50000; reason += " (Semi-Finalist)"; }
            }
        }

        if (rewardAmount > 0) {
            user.setCoins(user.getCoins() + rewardAmount);
            userRepository.save(user);
            // Optionally save to quest/history, but for now just update coins
        }
        
        // Finalize Trophy entry
        awardTrophies(tournament, user, tournament.getSeasonIndex());
    }

    private void handleLeaguePromotionAndRelegation(Tournament league, UserCareer career) {
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
