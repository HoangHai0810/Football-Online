package com.example.football.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;

@Component
public class TheSportsDbClient implements FootballDataClient {

    private final RestTemplate restTemplate;
    private static final String API_URL = "https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?t={teamName}";

    public TheSportsDbClient() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public List<ExternalPlayerDto> fetchPlayersByTeam(String teamName) {
        try {
            ResponseEntity<TheSportsDbResponse> response = restTemplate.getForEntity(API_URL, TheSportsDbResponse.class, teamName);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody().player != null ? response.getBody().player : new ArrayList<>();
            }
        } catch (Exception e) {
            System.err.println("Error fetching players for team " + teamName + ": " + e.getMessage());
        }
        return new ArrayList<>();
    }

    private static class TheSportsDbResponse {
        public List<ExternalPlayerDto> player;
    }
}
