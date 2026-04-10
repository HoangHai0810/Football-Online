package com.example.football.repository;

import com.example.football.entity.AiClub;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiClubRepository extends JpaRepository<AiClub, Long> {
    List<AiClub> findByLeagueTier(Integer leagueTier);
}
