package com.example.football.service;

import com.example.football.entity.PlayerCard;
import com.example.football.entity.Position;
import com.example.football.entity.SquadFormation;
import com.example.football.entity.Users;
import com.example.football.repository.SquadFormationRepository;
import com.example.football.repository.PlayerCardRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SquadService {

    private final SquadFormationRepository squadRepository;
    private final PlayerCardRepository playerCardRepository;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules();

    @Data
    @AllArgsConstructor
    public static class SlotInfo {
        private int slot;
        private Position pos;
    }

    private static final Map<String, List<SlotInfo>> FORMATIONS = Map.of(
        "4-3-3", List.of(
            new SlotInfo(0, Position.GK),
            new SlotInfo(1, Position.LB), new SlotInfo(2, Position.CB), new SlotInfo(3, Position.CB), new SlotInfo(4, Position.RB),
            new SlotInfo(5, Position.CM), new SlotInfo(6, Position.CDM), new SlotInfo(7, Position.CM),
            new SlotInfo(8, Position.LW), new SlotInfo(9, Position.ST), new SlotInfo(10, Position.RW)
        ),
        "4-4-2", List.of(
            new SlotInfo(0, Position.GK),
            new SlotInfo(1, Position.LB), new SlotInfo(2, Position.CB), new SlotInfo(3, Position.CB), new SlotInfo(4, Position.RB),
            new SlotInfo(5, Position.LM), new SlotInfo(6, Position.CM), new SlotInfo(7, Position.CM), new SlotInfo(8, Position.RM),
            new SlotInfo(9, Position.ST), new SlotInfo(10, Position.ST)
        ),
        "4-2-3-1", List.of(
            new SlotInfo(0, Position.GK),
            new SlotInfo(1, Position.LB), new SlotInfo(2, Position.CB), new SlotInfo(3, Position.CB), new SlotInfo(4, Position.RB),
            new SlotInfo(5, Position.CDM), new SlotInfo(6, Position.CDM),
            new SlotInfo(7, Position.CAM), new SlotInfo(8, Position.LM), new SlotInfo(9, Position.RM),
            new SlotInfo(10, Position.ST)
        ),
        "3-5-2", List.of(
            new SlotInfo(0, Position.GK),
            new SlotInfo(1, Position.CB), new SlotInfo(2, Position.CB), new SlotInfo(3, Position.CB),
            new SlotInfo(4, Position.LWB), new SlotInfo(5, Position.CDM), new SlotInfo(6, Position.CDM), new SlotInfo(7, Position.RWB), new SlotInfo(8, Position.CAM),
            new SlotInfo(9, Position.ST), new SlotInfo(10, Position.ST)
        ),
        "5-3-2", List.of(
            new SlotInfo(0, Position.GK),
            new SlotInfo(1, Position.LWB), new SlotInfo(2, Position.CB), new SlotInfo(3, Position.CB), new SlotInfo(4, Position.CB), new SlotInfo(5, Position.RWB),
            new SlotInfo(6, Position.CM), new SlotInfo(7, Position.CDM), new SlotInfo(8, Position.CM),
            new SlotInfo(9, Position.ST), new SlotInfo(10, Position.ST)
        )
    );

    private String getPosGroup(Position pos) {
        return switch (pos) {
            case GK -> "GK";
            case CB, LB, RB, LWB, RWB -> "DEF";
            case CDM, CM, CAM, LM, RM -> "MID";
            default -> "FWD";
        };
    }

    private int calculateEffectiveOvr(PlayerCard card, Position slotPos) {
        int baseOvr = card.getEffectiveOvr();
        Position natPos = card.getTemplate().getPosition();

        if (natPos == slotPos) return baseOvr;
        
        String natGroup = getPosGroup(natPos);
        String slotGroup = getPosGroup(slotPos);

        if (natGroup.equals(slotGroup)) return Math.max(1, baseOvr - 3);
        if (natGroup.equals("GK") || slotGroup.equals("GK")) return Math.max(1, baseOvr - 20);
        return Math.max(1, baseOvr - 8);
    }

    @Transactional
    public Map<String, Object> optimizeSquad(Users user) {
        long globalStartTime = System.currentTimeMillis();
        List<PlayerCard> allCards = playerCardRepository.findByOwnerId(user.getId());
        if (allCards.size() < 11) {
            throw new RuntimeException("Not enough players to optimize (need at least 11)");
        }

        List<PlayerCard> topPool = allCards.stream()
                .sorted((a, b) -> Integer.compare(b.getEffectiveOvr(), a.getEffectiveOvr()))
                .limit(18)
                .collect(Collectors.toList());

        String bestFormationName = "4-3-3";
        int bestGlobalTotalOvr = -1;
        Map<Integer, Long> bestGlobalLineup = new HashMap<>();

        for (Map.Entry<String, List<SlotInfo>> entry : FORMATIONS.entrySet()) {
            String formationName = entry.getKey();
            List<SlotInfo> slots = entry.getValue();

            List<SlotInfo> sortedSlots = new ArrayList<>(slots);
            sortedSlots.sort((a, b) -> a.getPos() == Position.GK ? -1 : (b.getPos() == Position.GK ? 1 : 0));

            OptimalResult result = findOptimalforFormation(sortedSlots, topPool);

            if (result.totalOvr > bestGlobalTotalOvr) {
                bestGlobalTotalOvr = result.totalOvr;
                bestFormationName = formationName;
                bestGlobalLineup = result.lineup;
            }
        }

        long duration = System.currentTimeMillis() - globalStartTime;
        System.out.println("Squad Optimization (Global) completed in " + duration + "ms.");

        // Save result
        SquadFormation squad = squadRepository.findByUser(user)
                .orElse(SquadFormation.builder().user(user).build());
        
        try {
            squad.setFormation(bestFormationName);
            squad.setLineupJson(objectMapper.writeValueAsString(bestGlobalLineup));
            squadRepository.save(squad);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save optimized lineup", e);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("formation", bestFormationName);
        result.put("totalOvr", bestGlobalTotalOvr / 11.0);
        return result;
    }

    private static class OptimalResult {
        int totalOvr = -1;
        Map<Integer, Long> lineup = new HashMap<>();
    }

    private OptimalResult findOptimalforFormation(List<SlotInfo> slots, List<PlayerCard> pool) {
        int numSlots = slots.size();
        int numPlayers = pool.size();
        
        // 1. Pre-calculate Score Matrix
        int[][] scoreMatrix = new int[numPlayers][numSlots];
        for (int pIdx = 0; pIdx < numPlayers; pIdx++) {
            for (int sIdx = 0; sIdx < numSlots; sIdx++) {
                scoreMatrix[pIdx][sIdx] = calculateEffectiveOvr(pool.get(pIdx), slots.get(sIdx).getPos());
            }
        }

        // 2. Pre-calculate max potentials
        int[] maxPotentials = new int[numSlots];
        for (int sIdx = 0; sIdx < numSlots; sIdx++) {
            int max = 0;
            for (int pIdx = 0; pIdx < numPlayers; pIdx++) {
                max = Math.max(max, scoreMatrix[pIdx][sIdx]);
            }
            maxPotentials[sIdx] = max;
        }

        // 3. Pre-sort players for each slot
        Integer[][] sortedIdxPerSlot = new Integer[numSlots][numPlayers];
        for (int sIdx = 0; sIdx < numSlots; sIdx++) {
            for (int pIdx = 0; pIdx < numPlayers; pIdx++) sortedIdxPerSlot[sIdx][pIdx] = pIdx;
            final int slot = sIdx;
            Arrays.sort(sortedIdxPerSlot[sIdx], (a, b) -> Integer.compare(scoreMatrix[b][slot], scoreMatrix[a][slot]));
        }

        OptimalResult best = new OptimalResult();

        int greedySum = 0;
        boolean[] greedyUsed = new boolean[numPlayers];
        for (int sIdx = 0; sIdx < numSlots; sIdx++) {
            int bestForSlot = -1;
            int bestScore = -100;
            for (int pIdx = 0; pIdx < numPlayers; pIdx++) {
                if (!greedyUsed[pIdx] && scoreMatrix[pIdx][sIdx] > bestScore) {
                    bestScore = scoreMatrix[pIdx][sIdx];
                    bestForSlot = pIdx;
                }
            }
            if (bestForSlot != -1) {
                greedyUsed[bestForSlot] = true;
                greedySum += bestScore;
                best.lineup.put(slots.get(sIdx).getSlot(), pool.get(bestForSlot).getId());
            }
        }
        best.totalOvr = greedySum;

        long formationStartTime = System.currentTimeMillis();
        backtrackOptimized(0, 0, new int[numSlots], new boolean[numPlayers], 
                          scoreMatrix, maxPotentials, sortedIdxPerSlot, best, slots, pool, formationStartTime);
        
        return best;
    }

    private void backtrackOptimized(int slotIdx, int currentSum, int[] currentAssignments, boolean[] used,
                                   int[][] scoreMatrix, int[] maxPotentials, Integer[][] sortedIdxPerSlot,
                                   OptimalResult best, List<SlotInfo> slots, List<PlayerCard> pool, long startTime) {
        
        if (System.currentTimeMillis() - startTime > 5000) return;

        if (slotIdx == slots.size()) {
            if (currentSum > best.totalOvr) {
                best.totalOvr = currentSum;
                best.lineup.clear();
                for (int i = 0; i < slots.size(); i++) {
                    best.lineup.put(slots.get(i).getSlot(), pool.get(currentAssignments[i]).getId());
                }
            }
            return;
        }

        int remainingMax = 0;
        for (int i = slotIdx; i < slots.size(); i++) {
            remainingMax += maxPotentials[i];
        }
        if (currentSum + remainingMax <= best.totalOvr) return;

        for (int pIdx : sortedIdxPerSlot[slotIdx]) {
            if (used[pIdx]) continue;

            used[pIdx] = true;
            currentAssignments[slotIdx] = pIdx;
            
            backtrackOptimized(slotIdx + 1, currentSum + scoreMatrix[pIdx][slotIdx], 
                               currentAssignments, used, scoreMatrix, maxPotentials, sortedIdxPerSlot, best, slots, pool, startTime);
            
            used[pIdx] = false;
        }
    }
}
