package com.example.football.repository;

import com.example.football.entity.Tournament;
import com.example.football.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByUserAndSeasonIndex(Users user, Integer seasonIndex);
    List<Tournament> findByUserAndSeasonIndexAndType(Users user, Integer seasonIndex, String type);
}
