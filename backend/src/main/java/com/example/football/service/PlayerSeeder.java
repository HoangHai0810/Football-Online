package com.example.football.service;

import com.example.football.entity.*;
import com.example.football.repository.PlayerTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PlayerSeeder {

    private final PlayerTemplateRepository repository;
    private final Random random = new Random();

    private static final String[] FIRST_NAMES = {"Alex", "Leo", "Chris", "David", "Marco", "Kevin", "Erling", "Kylian", "Luka", "Harry", "Mohamed", "Virgil", "Son", "Van", "Thiago", "Sergio", "Paulo", "Neymar", "Vinicius", "Jude"};
    private static final String[] LAST_NAMES = {"Silva", "Santos", "Fernandez", "Mbappe", "Messi", "Ronaldo", "De Bruyne", "Haaland", "Modric", "Kane", "Salah", "Van Dijk", "Bellingham", "Junior", "Diaz", "Pedri", "Gavi", "Martial", "Foden"};
    private static final String[] NATIONALITIES = {"Brazil", "Argentina", "France", "England", "Spain", "Germany", "Italy", "Portugal", "Netherlands", "Belgium", "Vietnam", "Japan", "Korea", "Norway", "Egypt", "Uruguay", "Croatia"};
    private static final String[] CLUBS = {"Real Madrid", "Man City", "Liverpool", "Arsenal", "Bayern Munich", "PSG", "Man Utd", "FC Barcelona", "Chelsea", "Inter Milan", "AC Milan", "Al Nassr", "Inter Miami", "Borussia Dortmund", "Atletico Madrid"};

    public void seedOneThousandPlayers() {
        if (repository.count() > 100) return; // Already seeded enough

        List<PlayerTemplate> players = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            int ovr = generateOvr();
            Season season = determineSeason(ovr);
            Position pos = Position.values()[random.nextInt(Position.values().length)];
            
            PlayerTemplate player = PlayerTemplate.builder()
                    .name(FIRST_NAMES[random.nextInt(FIRST_NAMES.length)] + " " + LAST_NAMES[random.nextInt(LAST_NAMES.length)])
                    .position(pos)
                    .age(18 + random.nextInt(20))
                    .height(170 + random.nextInt(30))
                    .weight(65 + random.nextInt(25))
                    .bodyType(BodyType.values()[random.nextInt(BodyType.values().length)])
                    .nationality(NATIONALITIES[random.nextInt(NATIONALITIES.length)])
                    .club(CLUBS[random.nextInt(CLUBS.length)])
                    .season(season)
                    .ovr(ovr)
                    .pace(clamp(ovr - 5 + random.nextInt(15)))
                    .shooting(clamp(ovr - 10 + random.nextInt(20)))
                    .passing(clamp(ovr - 5 + random.nextInt(15)))
                    .dribbling(clamp(ovr - 5 + random.nextInt(15)))
                    .defending(clamp(ovr - 15 + random.nextInt(25)))
                    .physical(clamp(ovr - 10 + random.nextInt(20)))
                    .traits(Collections.emptyList())
                    .build();
            
            // GK specific scaling
            if (pos == Position.GK) {
                player.setDiving(clamp(ovr - 5 + random.nextInt(15)));
                player.setReflexes(clamp(ovr - 5 + random.nextInt(15)));
                player.setHandling(clamp(ovr - 5 + random.nextInt(15)));
                player.setGkPositioning(clamp(ovr - 5 + random.nextInt(15)));
            }

            players.add(player);
            
            if (players.size() >= 100) {
                repository.saveAll(players);
                players.clear();
            }
        }
        if (!players.isEmpty()) {
            repository.saveAll(players);
        }
        System.out.println("Massive Seeding Completed: 1000 players added.");
    }

    private int generateOvr() {
        double roll = random.nextDouble();
        if (roll < 0.01) return 105 + random.nextInt(11); // Rare 105-115
        if (roll < 0.05) return 95 + random.nextInt(10);  // 95-104
        if (roll < 0.15) return 85 + random.nextInt(10);  // 85-94
        if (roll < 0.50) return 75 + random.nextInt(10);  // 75-84
        return 60 + random.nextInt(15);                   // 60-74
    }

    private Season determineSeason(int ovr) {
        if (ovr >= 105) return Season.ICON;
        if (ovr >= 95) return Season.TOTY;
        if (ovr >= 85) return Season.LIVE;
        return Season.BASE;
    }

    private int clamp(int val) {
        return Math.max(1, Math.min(130, val));
    }
}
