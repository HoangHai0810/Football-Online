package com.example.football.repository;

import com.example.football.entity.UserMission;
import com.example.football.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserMissionRepository extends JpaRepository<UserMission, Long> {
    List<UserMission> findByUser(Users user);
    Optional<UserMission> findByUserAndMissionId(Users user, Long missionId);
}
