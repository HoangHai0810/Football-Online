package com.example.football.repository;

import com.example.football.entity.PlayerTemplate;
import com.example.football.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlayerTemplateRepository extends JpaRepository<PlayerTemplate, Long> {
    Optional<PlayerTemplate> findByName(String name);
    Optional<PlayerTemplate> findFirstByNameAndSeason(String name, Season season);
    java.util.List<PlayerTemplate> findByOvrGreaterThanEqual(int ovr);
    java.util.List<PlayerTemplate> findByOvrGreaterThanEqualAndSeason(int ovr, Season season);
}
