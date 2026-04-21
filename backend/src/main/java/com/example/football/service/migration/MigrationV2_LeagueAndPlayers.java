package com.example.football.service.migration;

import com.example.football.entity.AiClub;
import com.example.football.repository.AiClubRepository;
import com.example.football.repository.PlayerTemplateRepository;
import com.example.football.service.PlayerSeeder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MigrationV2_LeagueAndPlayers implements DataMigration {

    private final AiClubRepository aiClubRepository;
    private final PlayerTemplateRepository playerTemplateRepository;
    private final PlayerSeeder playerSeeder;

    @Override
    public int getVersion() {
        return 2;
    }

    @Override
    public String getDescription() {
        return "Expansion: Tiered League (60 Clubs) and 1000+ Player Pool";
    }

    @Override
    public void execute() {
        syncAiClubs();
        syncPlayers();
    }

    private void syncAiClubs() {
        log.info("MigrationV2: Syncing 60 AI Clubs for Tiered League...");
        // Tier 1: 20 Elite Clubs (95-105 OVR)
        addClub("Real Madrid", 1, 105);
        addClub("Manchester City", 1, 104);
        addClub("Liverpool", 1, 103);
        addClub("Bayern Munchen", 1, 102);
        addClub("Inter Milan", 1, 101);
        addClub("Paris SG", 1, 100);
        addClub("Arsenal", 1, 99);
        addClub("Barcelona", 1, 98);
        addClub("Atletico", 1, 97);
        addClub("Bayer Leverkusen", 1, 96);
        addClub("Stuttgart", 1, 95);
        addClub("Aston Villa", 1, 95);
        addClub("AC Milan", 1, 96);
        addClub("Juventus", 1, 97);
        addClub("Dortmund", 1, 98);
        addClub("RB Leipzig", 1, 96);
        addClub("Tottenham", 1, 95);
        addClub("Man United", 1, 96);
        addClub("Newcastle", 1, 95);
        addClub("Napoli", 1, 96);

        // Tier 2: 20 Mid-tier Clubs (80-94 OVR)
        addClub("Leicester City", 2, 88);
        addClub("Southampton", 2, 85);
        addClub("Ipswich Town", 2, 82);
        addClub("Burnley", 2, 86);
        addClub("Luton Town", 2, 83);
        addClub("Sheffield Utd", 2, 82);
        addClub("Leeds United", 2, 87);
        addClub("West Brom", 2, 84);
        addClub("Norwich City", 2, 84);
        addClub("Hull City", 2, 81);
        addClub("Middlesbrough", 2, 83);
        addClub("Coventry City", 2, 82);
        addClub("Preston", 2, 80);
        addClub("Bristol City", 2, 80);
        addClub("Cardiff City", 2, 81);
        addClub("Swansea City", 2, 82);
        addClub("Watford", 2, 83);
        addClub("Sunderland", 2, 84);
        addClub("Plymouth Argyle", 2, 80);
        addClub("QPR", 2, 81);

        // Tier 3: 20 Lower-tier Clubs (70-79 OVR)
        addClub("Ha Noi FC", 3, 79);
        addClub("Viettel FC", 3, 78);
        addClub("CAHN FC", 3, 79);
        addClub("Thep Xanh Nam Dinh", 3, 77);
        addClub("LPBank HAGL", 3, 72);
        addClub("Becamex Binh Duong", 3, 75);
        addClub("Hai Phong FC", 3, 74);
        addClub("Dong A Thanh Hoa", 3, 74);
        addClub("Song Lam Nghe An", 3, 73);
        addClub("TP.HCM FC", 3, 72);
        addClub("Hong Linh Ha Tinh", 3, 71);
        addClub("Quang Nam FC", 3, 70);
        addClub("Khanh Hoa FC", 3, 70);
        addClub("MerryLand Quy Nhon", 3, 73);
        addClub("Da Nang FC", 3, 71);
        addClub("PVF-CAND", 3, 70);
        addClub("Wrexham AFC", 3, 72);
        addClub("Stockport County", 3, 71);
        addClub("Mansfield Town", 3, 70);
        addClub("MK Dons", 3, 70);
    }

    private void addClub(String name, int tier, int ovr) {
        AiClub club = aiClubRepository.findByName(name).orElse(new AiClub());
        club.setName(name);
        club.setLeagueTier(tier);
        club.setBaseOvr(ovr);
        aiClubRepository.save(club);
    }

    private void syncPlayers() {
        long currentCount = playerTemplateRepository.count();
        log.info("MigrationV2: Current player templates: {}. Goal: 1000+", currentCount);
        if (currentCount < 1000) {
            playerSeeder.seedOneThousandPlayers();
        }
    }
}
