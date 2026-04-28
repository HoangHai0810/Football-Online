package com.example.football.service.crawler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PlayerCrawlerJob {

    private final PlayerCrawlerService playerCrawlerService;

    private static final List<String> TOP_TEAMS = Arrays.asList(
            "Arsenal", "Manchester_United", "Manchester_City", "Liverpool", "Chelsea",
            "Real_Madrid", "Barcelona", "Atletico_Madrid",
            "Bayern_Munich", "Borussia_Dortmund",
            "Juventus", "AC_Milan", "Inter_Milan",
            "Paris_SG"
    );

    @Scheduled(cron = "0 0 2 * * ?")
    public void crawlDaily() {
        System.out.println("Starting daily player crawl...");
        for (String team : TOP_TEAMS) {
            System.out.println("Crawling team: " + team);
            playerCrawlerService.crawlAndSaveTeam(team);
        }
        System.out.println("Daily player crawl finished.");
    }
}
