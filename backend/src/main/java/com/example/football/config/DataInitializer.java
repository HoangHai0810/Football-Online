package com.example.football.config;

import com.example.football.entity.*;
import com.example.football.repository.PlayerTemplateRepository;
import com.example.football.repository.MissionRepository;
import com.example.football.service.PlayerSeeder;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Order(Ordered.LOWEST_PRECEDENCE)
public class DataInitializer implements CommandLineRunner {

    private final PlayerTemplateRepository repository;
    private final MissionRepository missionRepository;
    private final PlayerSeeder playerSeeder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        long corruptedCount = repository.findAll().stream()
                .filter(t -> t.getPace() == null || t.getShooting() == null || t.getOvr() == null)
                .count();
        
        if (corruptedCount > 0) {
            System.out.println("Found " + corruptedCount + " corrupted templates. Purging...");
            repository.deleteAll();
        }

        if (repository.count() == 0) {
            seedPlayers();
            playerSeeder.seedOneThousandPlayers();
        }
        
        if (missionRepository.count() == 0) {
            seedMissions();
        }
    }

    private void seedPlayers() {
        List<PlayerTemplate> players = Arrays.asList(
            PlayerTemplate.builder()
                .name("Lionel Messi")
                .position(Position.RW)
                .age(36)
                .height(170)
                .weight(72)
                .bodyType(BodyType.LEAN)
                .nationality("Argentina")
                .club("Inter Miami")
                .season(Season.ICON)
                .ovr(115)
                .pace(105).shooting(112).passing(118).dribbling(120).defending(45).physical(80)
                .acceleration(110).sprintSpeed(100)
                .finishing(115).shotPower(108).longShot(114).positioning(116).volleys(110)
                .shortPassing(120).longPassing(115).vision(122).crossing(105).curve(118)
                .dribblingStat(121).ballControl(120).agility(118).balance(122).reactions(115)
                .interceptions(40).marking(42).standingTackle(48).slidingTackle(38)
                .strength(78).aggression(75).stamina(95).jumping(82).heading(85)
                .attackingWorkRate(WorkRate.MEDIUM).defensiveWorkRate(WorkRate.LOW)
                .traits(Arrays.asList("Finesse Shot", "Playmaker", "Chip Shot"))
                .build(),

            PlayerTemplate.builder()
                .name("Cristiano Ronaldo")
                .position(Position.ST)
                .age(38)
                .height(187)
                .weight(83)
                .bodyType(BodyType.REPRESENTATIVE)
                .nationality("Portugal")
                .club("Al Nassr")
                .season(Season.ICON)
                .ovr(114)
                .pace(110).shooting(118).passing(102).dribbling(108).defending(40).physical(95)
                .acceleration(108).sprintSpeed(112)
                .finishing(120).shotPower(122).longShot(118).positioning(119).volleys(115)
                .shortPassing(105).longPassing(98).vision(102).crossing(95).curve(108)
                .dribblingStat(110).ballControl(112).agility(108).balance(100).reactions(118)
                .interceptions(35).marking(38).standingTackle(42).slidingTackle(32)
                .strength(98).aggression(88).stamina(92).jumping(125).heading(118)
                .attackingWorkRate(WorkRate.HIGH).defensiveWorkRate(WorkRate.LOW)
                .traits(Arrays.asList("Power Header", "Long Shot Taker", "Goal Poacher"))
                .build(),

            PlayerTemplate.builder()
                .name("Kylian Mbappé")
                .position(Position.ST)
                .age(25)
                .height(182)
                .weight(73)
                .bodyType(BodyType.LEAN)
                .nationality("France")
                .club("Real Madrid")
                .season(Season.TOTY)
                .ovr(112)
                .pace(122).shooting(108).passing(100).dribbling(115).defending(42).physical(88)
                .acceleration(125).sprintSpeed(120)
                .finishing(112).shotPower(105).longShot(100).positioning(114).volleys(98)
                .shortPassing(102).longPassing(92).vision(105).crossing(98).curve(102)
                .dribblingStat(118).ballControl(115).agility(120).balance(110).reactions(112)
                .interceptions(45).marking(40).standingTackle(42).slidingTackle(38)
                .strength(85).aggression(82).stamina(100).jumping(95).heading(90)
                .attackingWorkRate(WorkRate.HIGH).defensiveWorkRate(WorkRate.LOW)
                .traits(Arrays.asList("Speedster", "Clinical Finisher"))
                .build(),

            PlayerTemplate.builder()
                .name("Kevin De Bruyne")
                .position(Position.CAM)
                .age(32)
                .height(181)
                .weight(70)
                .bodyType(BodyType.REPRESENTATIVE)
                .nationality("Belgium")
                .club("Manchester City")
                .season(Season.LIVE)
                .ovr(110)
                .pace(85).shooting(105).passing(125).dribbling(108).defending(75).physical(88)
                .acceleration(82).sprintSpeed(88)
                .finishing(102).shotPower(118).longShot(120).positioning(110).volleys(108)
                .shortPassing(125).longPassing(128).vision(130).crossing(125).curve(120)
                .dribblingStat(108).ballControl(115).agility(100).balance(95).reactions(112)
                .interceptions(78).marking(72).standingTackle(80).slidingTackle(68)
                .strength(82).aggression(85).stamina(110).jumping(75).heading(82)
                .attackingWorkRate(WorkRate.HIGH).defensiveWorkRate(WorkRate.MEDIUM)
                .traits(Arrays.asList("Long Passer", "Visionary"))
                .build(),

            PlayerTemplate.builder()
                .name("Virgil van Dijk")
                .position(Position.CB)
                .age(32)
                .height(193)
                .weight(92)
                .bodyType(BodyType.STOCKY)
                .nationality("Netherlands")
                .club("Liverpool")
                .season(Season.LIVE)
                .ovr(109)
                .pace(92).shooting(65).passing(88).dribbling(82).defending(118).physical(115)
                .acceleration(88).sprintSpeed(95)
                .finishing(55).shotPower(92).longShot(68).positioning(75).volleys(60)
                .shortPassing(95).longPassing(102).vision(85).crossing(72).curve(75)
                .dribblingStat(82).ballControl(88).agility(78).balance(80).reactions(112)
                .interceptions(120).marking(118).standingTackle(122).slidingTackle(115)
                .strength(120).aggression(112).stamina(100).jumping(115).heading(122)
                .attackingWorkRate(WorkRate.MEDIUM).defensiveWorkRate(WorkRate.HIGH)
                .traits(Arrays.asList("Aerial Threat", "Leader"))
                .build()
        );

        repository.saveAll(players);
        System.out.println("Seeded database with 5 top players.");
    }

    private void seedMissions() {
        List<Mission> missions = Arrays.asList(
            Mission.builder().description("Open 1 Premium Pack").type(MissionType.OPEN_PACK).targetAmount(1).rewardCoins(5000L).build(),
            Mission.builder().description("Open 3 Elite Packs").type(MissionType.OPEN_PACK).targetAmount(3).rewardCoins(15000L).build(),
            Mission.builder().description("Win 1 Solo Match").type(MissionType.WIN_MATCH).targetAmount(1).rewardCoins(8000L).build(),
            Mission.builder().description("Win 5 Tournaments").type(MissionType.WIN_MATCH).targetAmount(5).rewardCoins(50000L).build(),
            Mission.builder().description("Upgrade 1 Player").type(MissionType.UPGRADE_PLAYER).targetAmount(1).rewardCoins(2000L).build(),
            Mission.builder().description("Collect 10 Players").type(MissionType.COLLECT_PLAYER).targetAmount(10).rewardCoins(10000L).build(),
            Mission.builder().description("Daily Login").type(MissionType.LOGIN_DAILY).targetAmount(1).rewardCoins(1000L).build()
        );
        missionRepository.saveAll(missions);
        System.out.println("Seeded database with 7 missions.");
    }
}
