package com.example.football.repository;

import com.example.football.entity.Tournament;
import com.example.football.entity.TournamentPlayerStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentPlayerStatRepository extends JpaRepository<TournamentPlayerStat, Long> {
    List<TournamentPlayerStat> findByTournamentOrderByGoalsDescAssistsDesc(Tournament tournament);
    List<TournamentPlayerStat> findByTournamentOrderByAssistsDescGoalsDesc(Tournament tournament);
    Optional<TournamentPlayerStat> findFirstByTournamentAndPlayerNameAndClubNameOrderByIdDesc(Tournament tournament, String playerName, String clubName);
    Optional<TournamentPlayerStat> findFirstByTournamentAndPlayerCardIdOrderByIdDesc(Tournament tournament, Long playerCardId);
}
