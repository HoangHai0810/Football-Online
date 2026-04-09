package com.example.football.repository;

import com.example.football.entity.SquadFormation;
import com.example.football.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SquadFormationRepository extends JpaRepository<SquadFormation, Long> {
    Optional<SquadFormation> findByUser(Users user);
}
