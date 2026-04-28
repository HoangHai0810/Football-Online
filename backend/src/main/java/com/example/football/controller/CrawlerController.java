package com.example.football.controller;

import com.example.football.service.crawler.PlayerCrawlerJob;
import com.example.football.service.crawler.PlayerCrawlerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/crawler")
@RequiredArgsConstructor
public class CrawlerController {

    private final PlayerCrawlerJob playerCrawlerJob;
    private final PlayerCrawlerService playerCrawlerService;

    @PostMapping("/trigger-daily")
    public ResponseEntity<?> triggerDailyCrawl() {
        new Thread(() -> {
            try {
                playerCrawlerJob.crawlDaily();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
        return ResponseEntity.ok(Map.of("message", "Daily crawl triggered asynchronously. Check logs for progress."));
    }

    @PostMapping("/trigger-team")
    public ResponseEntity<?> triggerTeamCrawl(@RequestParam String teamName) {
        new Thread(() -> {
            try {
                playerCrawlerService.crawlAndSaveTeam(teamName);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
        return ResponseEntity.ok(Map.of("message", "Crawl triggered for team: " + teamName));
    }
}
