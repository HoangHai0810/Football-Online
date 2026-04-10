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
        // 1. Get or Create UserCareer
        UserCareer career = userCareerRepository.findByUser(user)
                .orElseGet(() -> userCareerRepository.save(UserCareer.builder().user(user).build()));
        
        int seasonIndex = career.getCurrentSeason();
        
        // 2. Create Tournament
        Tournament league = Tournament.builder()
                .name("Super League Season " + seasonIndex)
                .type("LEAGUE")
                .seasonIndex(seasonIndex)
                .user(user)
                .build();
        league = tournamentRepository.save(league);

        // 3. Get AI Clubs for this tier
        List<AiClub> aiClubs = new ArrayList<>(aiClubRepository.findByLeagueTier(career.getCurrentTier()));
        
        // 4. Create Standings
        // Add User's Team
        standingRepository.save(TournamentStanding.builder()
                .tournament(league)
                .user(user)
                .isUserTeam(true)
                .build());
                
        // Add AI Teams (limit to 19 to have 20 teams total)
        List<AiClub> selectedAiClubs = aiClubs.subList(0, Math.min(aiClubs.size(), 19));
        for (AiClub club : selectedAiClubs) {
            standingRepository.save(TournamentStanding.builder()
                    .tournament(league)
                    .aiClub(club)
                    .isUserTeam(false)
                    .build());
        }

        // 5. Generate Fixtures (Round Robin)
        generateLeagueFixtures(league, user, selectedAiClubs);
    }

    private void generateLeagueFixtures(Tournament tournament, Users user, List<AiClub> aiClubs) {
        // Participants: User + AI Clubs
        // total teams = 20 (usually)
        int numTeams = aiClubs.size() + 1;
        
        // We need an even number of teams for standard round robin
        // If odd, we'd add a "BYE" team, but here we expect 20.
        
        List<Object> participants = new ArrayList<>();
        participants.add(user);
        participants.addAll(aiClubs);
        Collections.shuffle(participants);

        int rounds = (numTeams - 1) * 2; // Home and Away
        int matchesPerRound = numTeams / 2;

        for (int r = 0; r < rounds; r++) {
            int currentWeek = r + 1;
            for (int m = 0; m < matchesPerRound; m++) {
                int homeIdx = (r + m) % (numTeams - 1);
                int awayIdx = (numTeams - 1 - m + r) % (numTeams - 1);

                if (m == 0) {
                    awayIdx = numTeams - 1;
                }

                Object home = participants.get(homeIdx);
                Object away = participants.get(awayIdx);

                // Alternate home/away for the second half of the season
                if (r >= (numTeams - 1)) {
                    Object temp = home;
                    home = away;
                    away = temp;
                }

                MatchFixture fixture = MatchFixture.builder()
                        .tournament(tournament)
                        .matchWeek(currentWeek)
                        .build();

                if (home instanceof Users) {
                    fixture.setHomeUser((Users) home);
                    fixture.setHomeIsUser(true);
                } else {
                    fixture.setHomeAiClub((AiClub) home);
                }

                if (away instanceof Users) {
                    fixture.setAwayUser((Users) away);
                    fixture.setAwayIsUser(true);
                } else {
                    fixture.setAwayAiClub((AiClub) away);
                }

                fixtureRepository.save(fixture);
            }
        }
    }
}
