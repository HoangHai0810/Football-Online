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
    private final PlayerCardService playerCardService;
    private final InventoryService inventoryService;
    private final java.util.Random random = new java.util.Random();

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

        // Get active missions, shuffle and pick 6
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

    private Mission generateNextTierMission(Mission oldMission) {
        // Auto-generate a harder version of the claimed mission
        int newTarget = (int) Math.ceil(oldMission.getTargetAmount() * 1.5);
        long newCoins = (long) Math.ceil(oldMission.getRewardCoins() * 1.5);
        if (oldMission.getRewardCoins() == 0) newCoins = 0; // Keep 0 if it was pure pack/lucky BP

        // Upgrade pack randomly if it gets very hard
        String newPack = oldMission.getRewardPackId();
        if (newTarget > 10 && "starter".equals(newPack)) newPack = "veteran";
        if (newTarget > 25 && "veteran".equals(newPack)) newPack = "premium";
        if (newTarget > 50 && "premium".equals(newPack)) newPack = "all_star";

        // Keep Lucky BP
        boolean keepLucky = oldMission.isRewardLuckyBp();
        if (newTarget > 10 && random.nextDouble() > 0.8) keepLucky = true;

        String prefix = oldMission.getDescription().split(" -> ")[0].replaceAll("\\s\\(.*\\)", "");
        String newDesc = prefix + " (" + newTarget + " " + oldMission.getType().name().replace("_", " ") + ")";

        Mission nextM = Mission.builder()
                .description(newDesc)
                .type(oldMission.getType())
                .targetAmount(newTarget)
                .rewardCoins(newCoins)
                .rewardPackId(newPack)
                .rewardLuckyBp(keepLucky)
                .isActive(true)
                .build();
        return missionRepository.save(nextM);
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
        
        // 1. Regular Coins
        long totalCoins = um.getMission().getRewardCoins();
        
        // 2. Lucky BP
        if (um.getMission().isRewardLuckyBp()) {
            // Range 10,000 to 100,000
            long luckyAmount = 10000 + random.nextInt(90001);
            totalCoins += luckyAmount;
            results.put("luckyBp", luckyAmount);
        }
        
        if (totalCoins > 0) {
            user.setCoins(user.getCoins() + totalCoins);
            results.put("rewardCoins", totalCoins);
        }

        // 3. Player Pack -> Add to INVENTORY instead of opening
        if (um.getMission().getRewardPackId() != null && !um.getMission().getRewardPackId().isEmpty()) {
            inventoryService.addPack(user, um.getMission().getRewardPackId(), 1);
            results.put("rewardPackId", um.getMission().getRewardPackId());
            // We no longer return rewardCard strictly here since it goes to inventory.
        }
        
        userRepository.save(user);

        // Auto-generate endless scaling replacement mission
        Mission harderMission = generateNextTierMission(um.getMission());
        userMissionRepository.delete(um);

        UserMission nextUm = UserMission.builder()
                .user(user)
                .mission(harderMission)
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

        // Pick a random new mission
        List<Mission> allMissions = missionRepository.findByIsActiveTrue();
        Collections.shuffle(allMissions);
        // Ensure it's not exactly the same base mission
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
                .nextResetAt(um.getNextResetAt()) // Keep the same reset schedule
                .build();

        return userMissionRepository.save(newUm);
    }
}
