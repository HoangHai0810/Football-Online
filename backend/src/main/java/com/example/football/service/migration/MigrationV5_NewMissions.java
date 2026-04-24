package com.example.football.service.migration;

import com.example.football.entity.Mission;
import com.example.football.entity.MissionType;
import com.example.football.repository.MissionRepository;
import com.example.football.repository.UserMissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MigrationV5_NewMissions implements DataMigration {

    private final MissionRepository missionRepository;
    private final UserMissionRepository userMissionRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public int getVersion() {
        return 5;
    }

    @Override
    public String getDescription() {
        return "Update Mission Economy: Replace infinite 100 tiers with 30+ balanced, reproducible daily missions including PLAY_MATCH, FINISH_SEASON, and COLLECT_STAR_PLAYER.";
    }

    @Override
    @Transactional
    public void execute() {
        log.info("MigrationV5: Dropping old missions_type_check constraint if exists...");
        try {
            jdbcTemplate.execute("ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_type_check");
            log.info("MigrationV5: Constraint missions_type_check dropped successfully.");
        } catch (Exception e) {
            log.warn("MigrationV5: Could not drop constraint missions_type_check (it might not exist or name differs): {}", e.getMessage());
        }

        log.info("MigrationV5: Clearing old bloated missions and user missions...");
        userMissionRepository.deleteAll();
        missionRepository.deleteAll();

        List<Mission> missions = new ArrayList<>();

        missions.add(Mission.builder().description("Daily Login Bonus").type(MissionType.LOGIN_DAILY).targetAmount(1).rewardCoins(5000L).build());

        missions.add(Mission.builder().description("Warmup: Win 1 Match").type(MissionType.WIN_MATCH).targetAmount(1).rewardCoins(3000L).build());
        missions.add(Mission.builder().description("Consistency: Win 2 Matches").type(MissionType.WIN_MATCH).targetAmount(2).rewardCoins(6500L).build());
        missions.add(Mission.builder().description("Striker: Win 3 Matches").type(MissionType.WIN_MATCH).targetAmount(3).rewardCoins(10000L).rewardLuckyBp(true).build());
        missions.add(Mission.builder().description("Unstoppable: Win 4 Matches").type(MissionType.WIN_MATCH).targetAmount(4).rewardCoins(12500L).rewardPackId("starter").build());
        missions.add(Mission.builder().description("Dominator: Win 5 Matches").type(MissionType.WIN_MATCH).targetAmount(5).rewardCoins(16000L).rewardPackId("veteran").build());
        missions.add(Mission.builder().description("Invincible: Win 7 Matches").type(MissionType.WIN_MATCH).targetAmount(7).rewardCoins(22000L).rewardPackId("premium").rewardLuckyBp(true).build());
        missions.add(Mission.builder().description("Champion's Will: Win 10 Matches").type(MissionType.WIN_MATCH).targetAmount(10).rewardCoins(35000L).rewardPackId("all_star").build());

        missions.add(Mission.builder().description("Scout: Open 1 Pack").type(MissionType.OPEN_PACK).targetAmount(1).rewardCoins(2000L).build());
        missions.add(Mission.builder().description("Explorer: Open 2 Packs").type(MissionType.OPEN_PACK).targetAmount(2).rewardCoins(5000L).build());
        missions.add(Mission.builder().description("Recruiter: Open 3 Packs").type(MissionType.OPEN_PACK).targetAmount(3).rewardCoins(8500L).rewardLuckyBp(true).build());
        missions.add(Mission.builder().description("Supplier: Open 4 Packs").type(MissionType.OPEN_PACK).targetAmount(4).rewardCoins(11000L).rewardPackId("starter").build());
        missions.add(Mission.builder().description("Agent: Open 5 Packs").type(MissionType.OPEN_PACK).targetAmount(5).rewardCoins(14000L).rewardPackId("premium").build());
        missions.add(Mission.builder().description("Whale: Open 8 Packs").type(MissionType.OPEN_PACK).targetAmount(8).rewardCoins(20000L).rewardPackId("all_star").rewardLuckyBp(true).build());
        missions.add(Mission.builder().description("Addicted: Open 10 Packs").type(MissionType.OPEN_PACK).targetAmount(10).rewardCoins(30000L).rewardPackId("icon").build());

        missions.add(Mission.builder().description("Trainer: Upgrade 1 Player").type(MissionType.UPGRADE_PLAYER).targetAmount(1).rewardCoins(4000L).build());
        missions.add(Mission.builder().description("Instructor: Upgrade 2 Players").type(MissionType.UPGRADE_PLAYER).targetAmount(2).rewardCoins(8500L).build());
        missions.add(Mission.builder().description("Coach: Upgrade 3 Players").type(MissionType.UPGRADE_PLAYER).targetAmount(3).rewardCoins(12500L).rewardLuckyBp(true).build());
        missions.add(Mission.builder().description("Development: Upgrade 4 Players").type(MissionType.UPGRADE_PLAYER).targetAmount(4).rewardCoins(16000L).build());
        missions.add(Mission.builder().description("Manager: Upgrade 5 Players").type(MissionType.UPGRADE_PLAYER).targetAmount(5).rewardCoins(20000L).rewardPackId("live_master").build());
        missions.add(Mission.builder().description("Masterclass: Upgrade 7 Players").type(MissionType.UPGRADE_PLAYER).targetAmount(7).rewardCoins(28000L).rewardPackId("toty_upgrade").rewardLuckyBp(true).build());
        missions.add(Mission.builder().description("Visionary: Upgrade 10 Players").type(MissionType.UPGRADE_PLAYER).targetAmount(10).rewardCoins(45000L).rewardPackId("golden_ticket").build());

        missions.add(Mission.builder().description("Collector: Obtain 2 Players").type(MissionType.COLLECT_PLAYER).targetAmount(2).rewardCoins(3000L).build());
        missions.add(Mission.builder().description("Gatherer: Obtain 3 Players").type(MissionType.COLLECT_PLAYER).targetAmount(3).rewardCoins(5500L).build());
        missions.add(Mission.builder().description("Hoarder: Obtain 5 Players").type(MissionType.COLLECT_PLAYER).targetAmount(5).rewardCoins(9000L).build());
        missions.add(Mission.builder().description("Squad Builder: Obtain 8 Players").type(MissionType.COLLECT_PLAYER).targetAmount(8).rewardCoins(14000L).rewardLuckyBp(true).build());
        missions.add(Mission.builder().description("Talent Finder: Obtain 10 Players").type(MissionType.COLLECT_PLAYER).targetAmount(10).rewardCoins(18000L).rewardPackId("starter").build());
        missions.add(Mission.builder().description("Director: Obtain 15 Players").type(MissionType.COLLECT_PLAYER).targetAmount(15).rewardCoins(26000L).rewardPackId("veteran").rewardLuckyBp(true).build());
        missions.add(Mission.builder().description("Mass Recruiter: Obtain 20 Players").type(MissionType.COLLECT_PLAYER).targetAmount(20).rewardCoins(38000L).rewardPackId("premium").build());

        missions.add(Mission.builder().description("Participant: Play 2 Matches").type(MissionType.PLAY_MATCH).targetAmount(2).rewardCoins(4000L).build());
        missions.add(Mission.builder().description("Active Player: Play 5 Matches").type(MissionType.PLAY_MATCH).targetAmount(5).rewardCoins(8500L).rewardLuckyBp(true).build());
        missions.add(Mission.builder().description("Grinder: Play 10 Matches").type(MissionType.PLAY_MATCH).targetAmount(10).rewardCoins(20000L).rewardPackId("starter").build());

        missions.add(Mission.builder().description("Star Signing: Obtain 1 Player (90+ OVR)").type(MissionType.COLLECT_STAR_PLAYER).targetAmount(1).rewardCoins(10000L).rewardLuckyBp(true).build());
        missions.add(Mission.builder().description("Galacticos: Obtain 3 Players (90+ OVR)").type(MissionType.COLLECT_STAR_PLAYER).targetAmount(3).rewardCoins(30000L).rewardPackId("icon").build());

        missions.add(Mission.builder().description("Endurance: Finish 1 Season").type(MissionType.FINISH_SEASON).targetAmount(1).rewardCoins(50000L).rewardPackId("all_star").build());

        for (Mission m : missions) {
            m.setActive(true);
        }

        missionRepository.saveAll(missions);
        log.info("MigrationV5: Seeded database with {} balanced repeatable missions.", missions.size());
    }
}
