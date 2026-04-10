package com.example.football.repository;

import com.example.football.entity.MatchFixture;
import com.example.football.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchFixtureRepository extends JpaRepository<MatchFixture, Long> {
    List<MatchFixture> findByTournamentAndMatchWeek(Tournament tournament, Integer matchWeek);
    List<MatchFixture> findByTournament(Tournament tournament);
}
