package com.example.football.config;

import com.example.football.entity.*;
import com.example.football.repository.PlayerTemplateRepository;
import com.example.football.repository.PlayerCardRepository;
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
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.football.entity.AiClub;
import com.example.football.repository.AiClubRepository;

@Configuration
@RequiredArgsConstructor
@Order(Ordered.LOWEST_PRECEDENCE)
public class DataInitializer implements CommandLineRunner {

    private final PlayerTemplateRepository repository;
    private final PlayerCardRepository playerCardRepository;
    private final MissionRepository missionRepository;
    private final PlayerSeeder playerSeeder;
    private final AiClubRepository aiClubRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Initial seeds for totally empty database
        if (repository.count() == 0) {
            System.out.println("DataInitializer: Player templates will be seeded by Migrations.");
            // We no longer call seedPlayers() here to avoid duplicates and high OVRs
        }
        
        if (missionRepository.count() == 0) {
            System.out.println("DataInitializer: Initial seed for missions...");
            seedMissions();
        }

        if (aiClubRepository.count() == 0) {
            System.out.println("DataInitializer: Initial seed for AI Clubs...");
            seedAiClubs();
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
                .build(),

            PlayerTemplate.builder().name("Diego Maradona").position(Position.CAM).age(60).height(165).weight(70).bodyType(BodyType.STOCKY).nationality("Argentina").club("Napoli").season(Season.ICON).ovr(114).pace(105).shooting(112).passing(114).dribbling(120).defending(40).physical(85).acceleration(110).sprintSpeed(100).finishing(114).shotPower(105).longShot(110).positioning(112).volleys(108).shortPassing(114).longPassing(112).vision(118).crossing(110).curve(116).dribblingStat(122).ballControl(120).agility(120).balance(125).reactions(114).interceptions(45).marking(35).standingTackle(40).slidingTackle(38).strength(85).aggression(88).stamina(90).jumping(85).heading(82).attackingWorkRate(WorkRate.HIGH).defensiveWorkRate(WorkRate.LOW).traits(Arrays.asList("Playmaker", "Finesse Shot")).build(),
            PlayerTemplate.builder().name("Zinedine Zidane").position(Position.CAM).age(48).height(185).weight(80).bodyType(BodyType.REPRESENTATIVE).nationality("France").club("Real Madrid").season(Season.ICON).ovr(114).pace(95).shooting(110).passing(118).dribbling(116).defending(65).physical(90).acceleration(92).sprintSpeed(98).finishing(112).shotPower(110).longShot(114).positioning(110).volleys(118).shortPassing(120).longPassing(118).vision(120).crossing(112).curve(110).dribblingStat(118).ballControl(122).agility(100).balance(108).reactions(118).interceptions(68).marking(60).standingTackle(70).slidingTackle(65).strength(90).aggression(82).stamina(95).jumping(85).heading(98).attackingWorkRate(WorkRate.HIGH).defensiveWorkRate(WorkRate.MEDIUM).traits(Arrays.asList("Playmaker", "Elegance")).build(),
            PlayerTemplate.builder().name("Kaká").position(Position.CAM).age(42).height(186).weight(82).bodyType(BodyType.LEAN).nationality("Brazil").club("AC Milan").season(Season.ICON).ovr(107).pace(112).shooting(110).passing(112).dribbling(114).defending(45).physical(85).acceleration(114).sprintSpeed(110).finishing(112).shotPower(108).longShot(114).positioning(110).volleys(105).shortPassing(114).longPassing(108).vision(114).crossing(110).curve(108).dribblingStat(118).ballControl(114).agility(110).balance(105).reactions(112).interceptions(50).marking(42).standingTackle(45).slidingTackle(40).strength(82).aggression(75).stamina(94).jumping(80).heading(85).attackingWorkRate(WorkRate.HIGH).defensiveWorkRate(WorkRate.LOW).traits(Arrays.asList("Speedster", "Distance Shooter")).build(),
            PlayerTemplate.builder().name("Zlatan Ibrahimović").position(Position.ST).age(42).height(195).weight(95).bodyType(BodyType.STOCKY).nationality("Sweden").club("AC Milan").season(Season.ICON).ovr(111).pace(95).shooting(114).passing(102).dribbling(108).defending(45).physical(110).acceleration(92).sprintSpeed(98).finishing(118).shotPower(122).longShot(112).positioning(114).volleys(120).shortPassing(105).longPassing(90).vision(102).crossing(88).curve(95).dribblingStat(110).ballControl(114).agility(85).balance(80).reactions(110).interceptions(45).marking(35).standingTackle(48).slidingTackle(40).strength(118).aggression(112).stamina(88).jumping(100).heading(118).attackingWorkRate(WorkRate.MEDIUM).defensiveWorkRate(WorkRate.LOW).traits(Arrays.asList("Acrobat", "Power Free-Kick")).build(),
            PlayerTemplate.builder().name("Ronaldo Nazário").position(Position.ST).age(45).height(183).weight(82).bodyType(BodyType.REPRESENTATIVE).nationality("Brazil").club("Inter").season(Season.ICON).ovr(114).pace(118).shooting(118).passing(100).dribbling(118).defending(40).physical(95).acceleration(120).sprintSpeed(116).finishing(122).shotPower(114).longShot(110).positioning(118).volleys(114).shortPassing(105).longPassing(92).vision(102).crossing(95).curve(108).dribblingStat(122).ballControl(120).agility(114).balance(112).reactions(118).interceptions(45).marking(38).standingTackle(40).slidingTackle(38).strength(98).aggression(85).stamina(92).jumping(95).heading(98).attackingWorkRate(WorkRate.HIGH).defensiveWorkRate(WorkRate.LOW).traits(Arrays.asList("Speed Dribbler", "Clinical Finisher")).build(),
            PlayerTemplate.builder().name("Ronaldinho").position(Position.LW).age(44).height(180).weight(80).bodyType(BodyType.LEAN).nationality("Brazil").club("Barcelona").season(Season.ICON).ovr(114).pace(110).shooting(108).passing(114).dribbling(122).defending(42).physical(85).acceleration(112).sprintSpeed(108).finishing(110).shotPower(105).longShot(114).positioning(108).volleys(108).shortPassing(114).longPassing(112).vision(118).crossing(114).curve(120).dribblingStat(125).ballControl(122).agility(120).balance(114).reactions(112).interceptions(45).marking(38).standingTackle(45).slidingTackle(40).strength(85).aggression(80).stamina(90).jumping(85).heading(82).attackingWorkRate(WorkRate.HIGH).defensiveWorkRate(WorkRate.LOW).traits(Arrays.asList("Flair", "Free-kick Specialist")).build(),
            PlayerTemplate.builder().name("Paolo Maldini").position(Position.CB).age(55).height(186).weight(83).bodyType(BodyType.REPRESENTATIVE).nationality("Italy").club("AC Milan").season(Season.ICON).ovr(114).pace(98).shooting(60).passing(95).dribbling(85).defending(122).physical(110).acceleration(95).sprintSpeed(100).finishing(55).shotPower(68).longShot(60).positioning(70).volleys(58).shortPassing(98).longPassing(105).vision(85).crossing(92).curve(80).dribblingStat(85).ballControl(90).agility(88).balance(85).reactions(114).interceptions(125).marking(125).standingTackle(124).slidingTackle(126).strength(108).aggression(105).stamina(100).jumping(110).heading(118).attackingWorkRate(WorkRate.MEDIUM).defensiveWorkRate(WorkRate.HIGH).traits(Arrays.asList("Dives Into Tackles", "Leadership")).build(),
            PlayerTemplate.builder().name("Johan Cruyff").position(Position.CF).age(70).height(180).weight(71).bodyType(BodyType.LEAN).nationality("Netherlands").club("Ajax").season(Season.ICON).ovr(114).pace(112).shooting(110).passing(116).dribbling(118).defending(50).physical(84).acceleration(114).sprintSpeed(110).finishing(114).shotPower(105).longShot(110).positioning(118).volleys(112).shortPassing(118).longPassing(112).vision(122).crossing(114).curve(114).dribblingStat(120).ballControl(120).agility(118).balance(112).reactions(116).interceptions(55).marking(45).standingTackle(52).slidingTackle(45).strength(80).aggression(75).stamina(92).jumping(85).heading(88).attackingWorkRate(WorkRate.HIGH).defensiveWorkRate(WorkRate.LOW).traits(Arrays.asList("Playmaker", "Technical Dribbler")).build(),
            PlayerTemplate.builder().name("Pelé").position(Position.CAM).age(80).height(173).weight(70).bodyType(BodyType.LEAN).nationality("Brazil").club("Santos").season(Season.ICON).ovr(114).pace(114).shooting(116).passing(112).dribbling(118).defending(55).physical(88).acceleration(118).sprintSpeed(112).finishing(120).shotPower(110).longShot(114).positioning(118).volleys(118).shortPassing(114).longPassing(108).vision(116).crossing(110).curve(112).dribblingStat(120).ballControl(118).agility(120).balance(116).reactions(118).interceptions(60).marking(50).standingTackle(55).slidingTackle(48).strength(85).aggression(82).stamina(95).jumping(98).heading(108).attackingWorkRate(WorkRate.HIGH).defensiveWorkRate(WorkRate.MEDIUM).traits(Arrays.asList("Finesse Shot", "Flair")).build(),
            PlayerTemplate.builder().name("Thierry Henry").position(Position.ST).age(46).height(188).weight(83).bodyType(BodyType.LEAN).nationality("France").club("Arsenal").season(Season.ICON).ovr(112).pace(118).shooting(112).passing(105).dribbling(114).defending(45).physical(90).acceleration(120).sprintSpeed(116).finishing(116).shotPower(110).longShot(112).positioning(114).volleys(110).shortPassing(108).longPassing(95).vision(108).crossing(105).curve(114).dribblingStat(116).ballControl(114).agility(112).balance(100).reactions(112).interceptions(50).marking(40).standingTackle(48).slidingTackle(42).strength(92).aggression(80).stamina(92).jumping(90).heading(100).attackingWorkRate(WorkRate.HIGH).defensiveWorkRate(WorkRate.LOW).traits(Arrays.asList("Finesse Shot", "Speedster")).build()
        );

        repository.saveAll(players);
        System.out.println("Seeded database with 15 top players (Base + ICONs).");
    }

    private void seedMissions() {
        List<Mission> missions = Arrays.asList(
            Mission.builder().description("Starter Pack Opening: Open 1 Pack").type(MissionType.OPEN_PACK).targetAmount(1).rewardCoins(3000L).build(),
            Mission.builder().description("Pack Hunter: Open 3 Packs").type(MissionType.OPEN_PACK).targetAmount(3).rewardCoins(10000L).build(),
            Mission.builder().description("Pack Addict: Open 10 Packs").type(MissionType.OPEN_PACK).targetAmount(10).rewardCoins(40000L).build(),
            Mission.builder().description("Crazy Box: Open 25 Packs").type(MissionType.OPEN_PACK).targetAmount(25).rewardCoins(125000L).build(),
            
            Mission.builder().description("First Signing: Collect 1 Player").type(MissionType.COLLECT_PLAYER).targetAmount(1).rewardCoins(2000L).build(),
            Mission.builder().description("Building Squad: Collect 5 Players").type(MissionType.COLLECT_PLAYER).targetAmount(5).rewardCoins(12000L).build(),
            Mission.builder().description("Talent Scout: Collect 20 Players").type(MissionType.COLLECT_PLAYER).targetAmount(20).rewardCoins(55000L).build(),
            Mission.builder().description("Ultimate Collector: Collect 20 Players").type(MissionType.COLLECT_PLAYER).targetAmount(20).rewardCoins(100000L).build(),
            
            Mission.builder().description("First Upgrade: Upgrade 1 Player").type(MissionType.UPGRADE_PLAYER).targetAmount(1).rewardCoins(3000L).build(),
            Mission.builder().description("Enhancement: Upgrade 5 Players").type(MissionType.UPGRADE_PLAYER).targetAmount(5).rewardCoins(18000L).build(),
            Mission.builder().description("Upgrade Master: Upgrade 15 Players").type(MissionType.UPGRADE_PLAYER).targetAmount(15).rewardCoins(65000L).build(),
            
            Mission.builder().description("First Victory: Win 1 Match").type(MissionType.WIN_MATCH).targetAmount(1).rewardCoins(5000L).build(),
            Mission.builder().description("Winning Streak: Win 3 Matches").type(MissionType.WIN_MATCH).targetAmount(3).rewardCoins(18000L).build(),
            Mission.builder().description("Tournament Champion: Win 5 Tourneys").type(MissionType.WIN_MATCH).targetAmount(5).rewardCoins(50000L).build(),
            
            Mission.builder().description("Daily Login Bonus").type(MissionType.LOGIN_DAILY).targetAmount(1).rewardCoins(2000L).build()
        );
        missionRepository.saveAll(missions);
        System.out.println("Seeded database with " + missions.size() + " diverse missions.");
    }

    private void seedAiClubs() {
        // We want to ensure we have our 60 specific clubs. 
        // We check by name to avoid duplicates and preserve IDs for foreign keys.
        List<AiClub> newClubs = new ArrayList<>();
        
        // Optimize: Load all existing clubs once to avoid multiple selects in loop
        Map<String, AiClub> existingClubsMap = aiClubRepository.findAll().stream()
                .collect(Collectors.toMap(AiClub::getName, club -> club));
        
        // Tier 1: Elite Clubs (95-105 OVR)
        addOrUpdateClub(newClubs, existingClubsMap, "Real Madrid", 1, 105, "Vini Jr, K. Mbappé, J. Bellingham");
        addOrUpdateClub(newClubs, existingClubsMap, "Manchester City", 1, 104, "E. Haaland, K. De Bruyne, Phil Foden");
        addOrUpdateClub(newClubs, existingClubsMap, "Liverpool", 1, 103, "Mohamed Salah, Luis Díaz, V. van Dijk");
        addOrUpdateClub(newClubs, existingClubsMap, "Bayern Munchen", 1, 102, "Harry Kane, Leroy Sané, Jamal Musiala");
        addOrUpdateClub(newClubs, existingClubsMap, "Inter Milan", 1, 101, "Lautaro Martínez, Marcus Thuram, H. Calhanoglu");
        addOrUpdateClub(newClubs, existingClubsMap, "Paris SG", 1, 100, "O. Dembélé, Randal Kolo Muani, Vitinha");
        addOrUpdateClub(newClubs, existingClubsMap, "Arsenal", 1, 99, "Bukayo Saka, Martin Ødegaard, Kai Havertz");
        addOrUpdateClub(newClubs, existingClubsMap, "Barcelona", 1, 98, "Robert Lewandowski, Lamine Yamal, Raphinha");
        addOrUpdateClub(newClubs, existingClubsMap, "Atletico", 1, 97, "Antoine Griezmann, Álvaro Morata, Rodrigo De Paul");
        addOrUpdateClub(newClubs, existingClubsMap, "Bayer Leverkusen", 1, 96, "Florian Wirtz, Victor Boniface, Jeremie Frimpong");
        addOrUpdateClub(newClubs, existingClubsMap, "Stuttgart", 1, 95, "Serhou Guirassy, Deniz Undav, Chris Führich");
        addOrUpdateClub(newClubs, existingClubsMap, "Aston Villa", 1, 95, "Ollie Watkins, Leon Bailey, Douglas Luiz");
        addOrUpdateClub(newClubs, existingClubsMap, "AC Milan", 1, 96, "Rafael Leão, Olivier Giroud, Christian Pulisic");
        addOrUpdateClub(newClubs, existingClubsMap, "Juventus", 1, 97, "Dušan Vlahović, Federico Chiesa, Adrien Rabiot");
        addOrUpdateClub(newClubs, existingClubsMap, "Dortmund", 1, 98, "Niclas Füllkrug, Julian Brandt, Jadon Sancho");
        addOrUpdateClub(newClubs, existingClubsMap, "RB Leipzig", 1, 96, "Loïs Openda, Xavi Simons, Benjamin Šeško");
        addOrUpdateClub(newClubs, existingClubsMap, "Tottenham", 1, 95, "Heung-min Son, James Maddison, Richarlison");
        addOrUpdateClub(newClubs, existingClubsMap, "Man United", 1, 96, "Bruno Fernandes, Rasmus Højlund, A. Garnacho");
        addOrUpdateClub(newClubs, existingClubsMap, "Newcastle", 1, 95, "Alexander Isak, Anthony Gordon, Bruno Guimarães");
        addOrUpdateClub(newClubs, existingClubsMap, "Napoli", 1, 96, "Victor Osimhen, K. Kvaratskhelia, Matteo Politano");

        // Tier 2: Mid-tier Clubs (80-94 OVR)
        addOrUpdateClub(newClubs, existingClubsMap, "Leicester City", 2, 88, "Jamie Vardy, Stephy Mavididi, Kiernan Dewsbury-Hall");
        addOrUpdateClub(newClubs, existingClubsMap, "Southampton", 2, 85, "Adam Armstrong, Ché Adams, Kyle Walker-Peters");
        addOrUpdateClub(newClubs, existingClubsMap, "Ipswich Town", 2, 82, "Conor Chaplin, Nathan Broadhead, Leif Davis");
        addOrUpdateClub(newClubs, existingClubsMap, "Burnley", 2, 86, "Lyle Foster, Zeki Amdouni, Josh Brownhill");
        addOrUpdateClub(newClubs, existingClubsMap, "Luton Town", 2, 83, "Elijah Adebayo, Ross Barkley, Carlton Morris");
        addOrUpdateClub(newClubs, existingClubsMap, "Sheffield Utd", 2, 82, "Ben Brereton Díaz, Cameron Archer, Gustavo Hamer");
        addOrUpdateClub(newClubs, existingClubsMap, "Leeds United", 2, 87, "Crysencio Summerville, Georginio Rutter, Dan James");
        addOrUpdateClub(newClubs, existingClubsMap, "West Brom", 2, 84, "Brandon Thomas-Asante, John Swift, Grady Diangana");
        addOrUpdateClub(newClubs, existingClubsMap, "Norwich City", 2, 84, "Josh Sargent, Gabriel Sara, Jonathan Rowe");
        addOrUpdateClub(newClubs, existingClubsMap, "Hull City", 2, 81, "Jaden Philogene, Fábio Carvalho, Ozan Tufan");
        addOrUpdateClub(newClubs, existingClubsMap, "Middlesbrough", 2, 83, "Emmanuel Latte Lath, Finn Azaz, Isaiah Jones");
        addOrUpdateClub(newClubs, existingClubsMap, "Coventry City", 2, 82, "Haji Wright, Ellis Simms, Callum O'Hare");
        addOrUpdateClub(newClubs, existingClubsMap, "Preston", 2, 80, "Will Keane, Mads Frökjaer-Jensen, Emil Riis");
        addOrUpdateClub(newClubs, existingClubsMap, "Bristol City", 2, 80, "Tommy Conway, Anis Mehmeti, Nahki Wells");
        addOrUpdateClub(newClubs, existingClubsMap, "Cardiff City", 2, 81, "Karlan Grant, Perry Ng, Rubin Colwill");
        addOrUpdateClub(newClubs, existingClubsMap, "Swansea City", 2, 82, "Jerry Yates, Jamie Paterson, Matt Grimes");
        addOrUpdateClub(newClubs, existingClubsMap, "Watford", 2, 83, "Mileta Rajovic, Ken Sema, Yáser Asprilla");
        addOrUpdateClub(newClubs, existingClubsMap, "Sunderland", 2, 84, "Jack Clarke, Jobe Bellingham, Dan Neil");
        addOrUpdateClub(newClubs, existingClubsMap, "Plymouth Argyle", 2, 80, "Morgan Whittaker, Ryan Hardie, Adam Randell");
        addOrUpdateClub(newClubs, existingClubsMap, "QPR", 2, 81, "Ilias Chair, Lyndon Dykes, Chris Willock");

        // Tier 3: Lower-tier Clubs (70-79 OVR)
        addOrUpdateClub(newClubs, existingClubsMap, "Ha Noi FC", 3, 79, "Nguyễn Văn Quyết, Phạm Tuấn Hải, Đỗ Hùng Dũng");
        addOrUpdateClub(newClubs, existingClubsMap, "Viettel FC", 3, 78, "Nguyễn Hoàng Đức, Bùi Tiến Dũng, Nhâm Mạnh Dũng");
        addOrUpdateClub(newClubs, existingClubsMap, "CAHN FC", 3, 79, "Nguyễn Quang Hải, Vũ Văn Thanh, Đoàn Văn Hậu");
        addOrUpdateClub(newClubs, existingClubsMap, "Thep Xanh Nam Dinh", 3, 77, "Rafaelson, Hendrio Araujo, Nguyễn Văn Toàn");
        addOrUpdateClub(newClubs, existingClubsMap, "LPBank HAGL", 3, 72, "Châu Ngọc Quang, Trần Minh Vương, Quốc Việt");
        addOrUpdateClub(newClubs, existingClubsMap, "Becamex Binh Duong", 3, 75, "Nguyễn Tiến Linh, Quế Ngọc Hải, Vĩ Hào");
        addOrUpdateClub(newClubs, existingClubsMap, "Hai Phong FC", 3, 74, "Joseph Mpande, Lương Xuân Trường, Lucao");
        addOrUpdateClub(newClubs, existingClubsMap, "Dong A Thanh Hoa", 3, 74, "Rimario Gordon, Luiz Antonio, Trịnh Văn Lợi");
        addOrUpdateClub(newClubs, existingClubsMap, "Song Lam Nghe An", 3, 73, "Đinh Xuân Tiến, Olaha, Phan Đình Duy");
        addOrUpdateClub(newClubs, existingClubsMap, "TP.HCM FC", 3, 72, "Ngô Tùng Quốc, Patrik Lê Giang, Timite");
        addOrUpdateClub(newClubs, existingClubsMap, "Hong Linh Ha Tinh", 3, 71, "Trần Phi Sơn, Diallo, Vũ Quang Nam");
        addOrUpdateClub(newClubs, existingClubsMap, "Quang Nam FC", 3, 70, "Hoàng Vũ Samson, Đình Bắc, Paulo Conrado");
        addOrUpdateClub(newClubs, existingClubsMap, "Khanh Hoa FC", 3, 70, "Le Duy Thanh, Guirassy, Douglas");
        addOrUpdateClub(newClubs, existingClubsMap, "MerryLand Quy Nhon", 3, 73, "Alan Grafite, Leo Artur, Đặng Văn Lâm");
        addOrUpdateClub(newClubs, existingClubsMap, "Da Nang FC", 3, 71, "Phạm Đình Duy, Minh Quang, Lương Duy Cương");
        addOrUpdateClub(newClubs, existingClubsMap, "PVF-CAND", 3, 70, "Lê Minh Bình, Thanh Nhàn, Công Đến");
        addOrUpdateClub(newClubs, existingClubsMap, "Wrexham AFC", 3, 72, "Paul Mullin, Steven Fletcher, Elliot Lee");
        addOrUpdateClub(newClubs, existingClubsMap, "Stockport County", 3, 71, "Isaac Olaofe, Paddy Madden, Louis Barry");
        addOrUpdateClub(newClubs, existingClubsMap, "Mansfield Town", 3, 70, "Lucas Akins, Davis Keillor-Dunn, Will Swan");
        addOrUpdateClub(newClubs, existingClubsMap, "MK Dons", 3, 70, "Max Dean, Alex Gilbey, Joe Tomlinson");

        aiClubRepository.saveAll(newClubs);
        System.out.println("DataInitializer: Synced 60 AI Clubs (Upsert).");
    }

    private void addOrUpdateClub(List<AiClub> list, Map<String, AiClub> map, String name, int tier, int ovr, String stars) {
        AiClub club = map.getOrDefault(name, new AiClub());
        club.setName(name);
        club.setLeagueTier(tier);
        club.setBaseOvr(ovr);
        club.setStarPlayers(stars);
        list.add(club);
    }
}
