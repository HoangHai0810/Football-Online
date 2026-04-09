package com.example.football.service;

import com.example.football.entity.*;
import com.example.football.repository.MissionRepository;
import com.example.football.repository.UserMissionRepository;
import com.example.football.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MissionService {

    private final MissionRepository missionRepository;
    private final UserMissionRepository userMissionRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<UserMission> getActiveMissionsForUser(String username) {
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserMission> userMissions = userMissionRepository.findByUser(user);
        
        // Logic to reset/refresh every 3 hours
        if (userMissions.isEmpty() || shouldReset(userMissions)) {
            return refreshMissions(user);
        }

        return userMissions;
    }

    private boolean shouldReset(List<UserMission> missions) {
        if (missions.isEmpty()) return true;
        return LocalDateTime.now().isAfter(missions.get(0).getNextResetAt());
    }

    private List<UserMission> refreshMissions(Users user) {
        // Delete old missions
        List<UserMission> oldMissions = userMissionRepository.findByUser(user);
        userMissionRepository.deleteAll(oldMissions);

        // Get all active missions, shuffle and pick 6
        List<Mission> allMissions = missionRepository.findByIsActiveTrue();
        Collections.shuffle(allMissions);
        List<Mission> selected = allMissions.stream().limit(6).collect(Collectors.toList());

        LocalDateTime nextReset = LocalDateTime.now().plusHours(3);

        List<UserMission> newMissions = selected.stream()
                .map(m -> UserMission.builder()
                        .user(user)
                        .mission(m)
                        .currentAmount(0)
                        .completed(false)
                        .claimed(false)
                        .nextResetAt(nextReset)
                        .build())
                .collect(Collectors.toList());

        return userMissionRepository.saveAll(newMissions);
    }

    @Transactional
    public void updateProgress(String username, MissionType type, int amount) {
        Users user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return;

        List<UserMission> userMissions = userMissionRepository.findByUser(user);
        for (UserMission um : userMissions) {
            if (um.getMission().getType() == type && !um.isCompleted()) {
                um.setCurrentAmount(um.getCurrentAmount() + amount);
                if (um.getCurrentAmount() >= um.getMission().getTargetAmount()) {
                    um.setCompleted(true);
                    um.setCurrentAmount(um.getMission().getTargetAmount());
                }
                userMissionRepository.save(um);
            }
        }
    }

    @Transactional
    public Long claimReward(String username, Long userMissionId) {
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserMission um = userMissionRepository.findById(userMissionId)
                .orElseThrow(() -> new RuntimeException("Mission not found"));

        if (!um.getUser().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");
        if (!um.isCompleted()) throw new RuntimeException("Mission not completed");
        if (um.isClaimed()) throw new RuntimeException("Already claimed");

        um.setClaimed(true);
        user.setCoins(user.getCoins() + um.getMission().getRewardCoins());
        
        userMissionRepository.save(um);
        userRepository.save(user);

        return um.getMission().getRewardCoins();
    }
}
