package com.example.football.repository;

import com.example.football.entity.Tournament;
import com.example.football.entity.TournamentStanding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentStandingRepository extends JpaRepository<TournamentStanding, Long> {
    List<TournamentStanding> findByTournamentOrderByPointsDescGoalsForDesc(Tournament tournament); // Simple BXH ordering
}
