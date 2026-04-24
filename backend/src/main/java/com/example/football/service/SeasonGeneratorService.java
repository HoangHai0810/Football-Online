package com.example.football.service;

import com.example.football.entity.*;
import com.example.football.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeasonGeneratorService {

    private final AiClubRepository aiClubRepository;
    private final TournamentRepository tournamentRepository;
    private final TournamentStandingRepository standingRepository;
    private final MatchFixtureRepository fixtureRepository;
    private final UserCareerRepository userCareerRepository;

    @Transactional
    public void createNewSeason(Users user) {
        UserCareer career = userCareerRepository.findFirstByUserOrderByIdDesc(user)
                .orElseGet(() -> userCareerRepository.save(UserCareer.builder().user(user).build()));
        
        int seasonIndex = career.getCurrentSeason();

        String     leagueName = getLeagueName(career.getCurrentTier());
        Tournament league     = createTournament(user, leagueName, "LEAGUE", career.getCurrentTier(), seasonIndex);
        
        List<AiClub> leagueAiClubs = aiClubRepository.findByLeagueTier(career.getCurrentTier());
        Collections.shuffle(leagueAiClubs);
        List<AiClub> selectedLeagueClubs = leagueAiClubs.subList(0, Math.min(leagueAiClubs.size(), 19));
        
        setupStandings(league, user, selectedLeagueClubs);
        generateLeagueFixtures(league, user, selectedLeagueClubs);

        Tournament   cup        = createTournament(user, "Grand Victory Cup", "CUP", 0, seasonIndex);
        List<AiClub> cupAiClubs = aiClubRepository.findByLeagueTier(1);                                // Start with all Tier 1
        Collections.shuffle(cupAiClubs);
        List<AiClub> selectedCupClubs = new ArrayList<>(cupAiClubs.subList(0, Math.min(cupAiClubs.size(), 15)));
        
        setupStandings(cup, user, selectedCupClubs);
        generateKnockoutFixtures(cup, user, selectedCupClubs);

        if (seasonIndex > 1) {
            Tournament superCup = createTournament(user, "Season Shield", "SUPER_CUP", 0, seasonIndex);
            AiClub     opponent = aiClubRepository.findByLeagueTier(1).get(0);
            generateSingleMatch(superCup, user, opponent, 0);
        }

        if (career.getCurrentTier() == 1) {
            Tournament   champions        = createTournament(user, "Inter-Continental Champions Cup", "CONTINENTAL", 0, seasonIndex);
            List<AiClub> continentalClubs = aiClubRepository.findByLeagueTier(1);
            Collections.shuffle(continentalClubs);
            List<AiClub> selectedContiClubs = continentalClubs.subList(0, Math.min(continentalClubs.size(), 7));
            
            setupStandings(champions, user, selectedContiClubs);
            generateContinentalFixtures(champions, user, selectedContiClubs);
        }
    }

    private String getLeagueName(int tier) {
        return switch (tier) {
            case 1 -> "Elite Premier League";
            case 2 -> "Championship";
            case 3 -> "National League";
            default -> "Professional League";
        };
    }

    private Tournament createTournament(Users user, String name, String type, int tier, int seasonIndex) {
        return tournamentRepository.save(Tournament.builder()
                .name(name)
                .type(type)
                .tier(tier)
                .seasonIndex(seasonIndex)
                .user(user)
                .build());
    }

    private void setupStandings(Tournament tournament, Users user, List<AiClub> aiClubs) {
        standingRepository.save(TournamentStanding.builder()
                .tournament(tournament).user(user).isUserTeam(true).build());
        for (AiClub club : aiClubs) {
            standingRepository.save(TournamentStanding.builder()
                    .tournament(tournament).aiClub(club).isUserTeam(false).build());
        }
    }

    private void generateLeagueFixtures(Tournament tournament, Users user, List<AiClub> aiClubs) {
        int          numTeams     = aiClubs.size() + 1;
        List<Object> participants = new ArrayList<>();
        participants.add(user);
        participants.addAll(aiClubs);
        Collections.shuffle(participants);

        int rounds          = (numTeams - 1) * 2;
        int matchesPerRound = numTeams / 2;

        for (int r = 0; r < rounds; r++) {
            int matchWeek = r + 1;
            for (int m = 0; m < matchesPerRound; m++) {
                int homeIdx          = (r + m) % (numTeams - 1);
                int awayIdx          = (numTeams - 1 - m + r) % (numTeams - 1);
                if  (m == 0) awayIdx = numTeams - 1;

                Object home = participants.get(homeIdx);
                Object away = participants.get(awayIdx);
                if (r >= (numTeams - 1)) { Object t = home; home = away; away = t; }

                saveFixture(tournament, matchWeek, home, away, false);
            }
        }
    }

    private void generateKnockoutFixtures(Tournament tournament, Users user, List<AiClub> aiClubs) {
        List<Object> participants = new ArrayList<>();
        participants.add(user);
        participants.addAll(aiClubs);
        Collections.shuffle(participants);

        for (int i = 0; i < participants.size(); i += 2) {
            saveFixture(tournament, 2, participants.get(i), participants.get(i+1), true);
        }
    }

    private void generateContinentalFixtures(Tournament tournament, Users user, List<AiClub> aiClubs) {
        int          [] weeks     = {4, 8, 14, 18, 24, 28};
        List<Object> participants = new ArrayList<>();
        participants.add(user);
        participants.addAll(aiClubs);
        
        for (int i = 0; i < weeks.length; i++) {
            for (int j = 0; j < participants.size(); j += 2) {
                saveFixture(tournament, weeks[i], participants.get(j), participants.get(j+1), false);
            }
        }
    }

    private void generateSingleMatch(Tournament tournament, Users user, AiClub opponent, int week) {
        saveFixture(tournament, week, user, opponent, true);
    }

    private void saveFixture(Tournament tournament, int week, Object home, Object away, boolean isKnockout) {
        MatchFixture.builder()
                .tournament(tournament)
                .matchWeek(week)
                .isKnockout(isKnockout)
                .homeUser(home instanceof Users ? (Users) home : null)
                .homeAiClub(home instanceof AiClub ? (AiClub) home : null)
                .homeIsUser(home instanceof Users)
                .awayUser(away instanceof Users ? (Users) away : null)
                .awayAiClub(away instanceof AiClub ? (AiClub) away : null)
                .awayIsUser(away instanceof Users)
                .build();

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
}
