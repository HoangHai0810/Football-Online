package com.example.football.repository;

import com.example.football.entity.Trophy;
import com.example.football.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrophyRepository extends JpaRepository<Trophy, Long> {
    List<Trophy> findByUserOrderByWonAtDesc(Users user);
}
