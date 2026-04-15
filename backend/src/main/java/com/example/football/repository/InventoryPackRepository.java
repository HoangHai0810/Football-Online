package com.example.football.repository;

import com.example.football.entity.InventoryPack;
import com.example.football.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryPackRepository extends JpaRepository<InventoryPack, Long> {
    List<InventoryPack> findByUser(Users user);
    Optional<InventoryPack> findByUserAndPackId(Users user, String packId);
}
