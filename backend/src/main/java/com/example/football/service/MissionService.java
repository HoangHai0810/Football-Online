package com.example.football.service;

import com.example.football.entity.*;
import com.example.football.repository.MissionRepository;
import com.example.football.repository.UserMissionRepository;
import com.example.football.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

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
    private final InventoryService inventoryService;
    private final java.util.Random random = new java.util.Random();

    @Transactional
    public List<UserMission> getActiveMissionsForUser(String username) {
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserMission> userMissions = userMissionRepository.findByUser(user);
        
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
        List<UserMission> oldMissions = userMissionRepository.findByUser(user);
        userMissionRepository.deleteAll(oldMissions);

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
    public java.util.Map<String, Object> claimReward(String username, Long userMissionId) {
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserMission um = userMissionRepository.findById(userMissionId)
                .orElseThrow(() -> new RuntimeException("Mission not found"));

        if (!um.getUser().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");
        if (!um.isCompleted()) throw new RuntimeException("Mission not completed");
        if (um.isClaimed()) throw new RuntimeException("Already claimed");

        um.setClaimed(true);
        userMissionRepository.save(um);

        java.util.Map<String, Object> results = new java.util.HashMap<>();
        
        long totalCoins = um.getMission().getRewardCoins();
        
        if (um.getMission().isRewardLuckyBp()) {
            long luckyAmount  = 10000 + random.nextInt(90001);
                 totalCoins  += luckyAmount;
            results.put("luckyBp", luckyAmount);
        }
        
        if (totalCoins > 0) {
            user.setCoins(user.getCoins() + totalCoins);
            results.put("rewardCoins", totalCoins);
        }

        if (um.getMission().getRewardPackId() != null && !um.getMission().getRewardPackId().isEmpty()) {
            inventoryService.addPack(user, um.getMission().getRewardPackId(), 1);
            results.put("rewardPackId", um.getMission().getRewardPackId());
        }
        
        userRepository.save(user);

        List<Mission> allMissions = missionRepository.findByIsActiveTrue();
        Collections.shuffle(allMissions);
        Mission nextMission = allMissions.stream()
                .filter(m -> !m.getId().equals(um.getMission().getId()))
                .findFirst()
                .orElse(allMissions.get(0));

        userMissionRepository.delete(um);

        UserMission nextUm = UserMission.builder()
                .user(user)
                .mission(nextMission)
                .currentAmount(0)
                .completed(false)
                .claimed(false)
                .nextResetAt(um.getNextResetAt())
                .build();
        userMissionRepository.save(nextUm);

        return results;
    }

    @Transactional
    public UserMission rerollMission(String username, Long userMissionId) {
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getCoins() < 200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough coins (200 required to refresh)");
        }

        UserMission um = userMissionRepository.findById(userMissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mission not found"));

        if (!um.getUser().getId().equals(user.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");

        user.setCoins(user.getCoins() - 200);
        userRepository.save(user);

        List<Mission> allMissions = missionRepository.findByIsActiveTrue();
        Collections.shuffle(allMissions);
        Mission newMission = allMissions.stream()
                .filter(m -> !m.getId().equals(um.getMission().getId()))
                .findFirst()
                .orElse(allMissions.get(0));

        userMissionRepository.delete(um);

        UserMission newUm = UserMission.builder()
                .user(user)
                .mission(newMission)
                .currentAmount(0)
                .completed(false)
                .claimed(false)
                .nextResetAt(um.getNextResetAt())
                .build();

        return userMissionRepository.save(newUm);
    }
}
