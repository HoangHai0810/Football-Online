package com.example.football.repository;

import com.example.football.entity.PlayerCard;
import com.example.football.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerCardRepository extends JpaRepository<PlayerCard, Long> {
    List<PlayerCard> findByOwner(Users owner);
    List<PlayerCard> findByOwnerId(Long userId);
}
