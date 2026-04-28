package com.example.football;

import com.example.football.entity.PlayerTemplate;
import com.example.football.repository.PlayerTemplateRepository;
import com.example.football.service.crawler.PlayerCrawlerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
@ActiveProfiles("dev")
class CrawlerTest {

    @Autowired
    private PlayerCrawlerService playerCrawlerService;

    @Autowired
    private PlayerTemplateRepository playerTemplateRepository;

    @Test
    void testCrawlerPullsArsenalPlayers() {
        playerCrawlerService.crawlAndSaveTeam("Arsenal");

        List<PlayerTemplate> players = playerTemplateRepository.findAll();
        
        List<PlayerTemplate> arsenalPlayers = players.stream()
                .filter(p -> "Arsenal".equalsIgnoreCase(p.getClub()))
                .toList();
                
        System.out.println("Crawler fetched " + arsenalPlayers.size() + " Arsenal players.");
        arsenalPlayers.stream().limit(5).forEach(p -> {
            System.out.println(String.format("Player: %s | Pos: %s | OVR: %d | PAC: %d | SHO: %d | PAS: %d | DRI: %d | DEF: %d | PHY: %d",
                    p.getName(), p.getPosition(), p.getOvr(), p.getPace(), p.getShooting(), p.getPassing(), p.getDribbling(), p.getDefending(), p.getPhysical()));
        });

        assertFalse(players.isEmpty(), "Crawler should have inserted players into the DB");
    }
}
