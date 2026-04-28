package com.example.football.service.crawler;

import com.example.football.client.FootballDataClient;
import com.example.football.entity.BodyType;
import com.example.football.entity.PlayerTemplate;
import com.example.football.entity.Position;
import com.example.football.entity.Season;
import com.example.football.repository.PlayerTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PlayerCrawlerService {

    private final FootballDataClient footballDataClient;
    private final PlayerTemplateRepository playerTemplateRepository;
    private final Random random = new Random();

    @Transactional
    public void crawlAndSaveTeam(String teamName) {
        List<FootballDataClient.ExternalPlayerDto> players = footballDataClient.fetchPlayersByTeam(teamName);
        for (FootballDataClient.ExternalPlayerDto dto : players) {
            savePlayerDto(dto);
        }
    }

    private void savePlayerDto(FootballDataClient.ExternalPlayerDto dto) {
        if (dto.strPlayer == null || dto.strPlayer.isEmpty()) return;

        if (playerTemplateRepository.findByNameContainingIgnoreCase(dto.strPlayer).size() > 0) {
            return;
        }

        int age = 25;
        if (dto.dateBorn != null && !dto.dateBorn.isEmpty()) {
            try {
                LocalDate birthDate = LocalDate.parse(dto.dateBorn);
                age = Period.between(birthDate, LocalDate.now()).getYears();
            } catch (Exception ignored) {}
        }

        Position position = mapPosition(dto.strPosition);
        int baseOvr = 70 + random.nextInt(15);

        PlayerTemplate newPlayer = PlayerTemplate.builder()
                .name(dto.strPlayer)
                .nationality(dto.strNationality)
                .club(dto.strTeam)
                .position(position)
                .age(age)
                .height(parseHeight(dto.strHeight))
                .weight(parseWeight(dto.strWeight))
                .bodyType(BodyType.MEDIUM)
                .season(Season.BASE)
                .ovr(baseOvr)
                .pace(calculateRealisticStat(position, "pace", baseOvr))
                .shooting(calculateRealisticStat(position, "shooting", baseOvr))
                .passing(calculateRealisticStat(position, "passing", baseOvr))
                .dribbling(calculateRealisticStat(position, "dribbling", baseOvr))
                .defending(calculateRealisticStat(position, "defending", baseOvr))
                .physical(calculateRealisticStat(position, "physical", baseOvr))
                .diving(position == Position.GK ? calculateRealisticStat(position, "gk", baseOvr) : null)
                .reflexes(position == Position.GK ? calculateRealisticStat(position, "gk", baseOvr) : null)
                .handling(position == Position.GK ? calculateRealisticStat(position, "gk", baseOvr) : null)
                .gkPositioning(position == Position.GK ? calculateRealisticStat(position, "gk", baseOvr) : null)
                .build();

        playerTemplateRepository.save(newPlayer);
    }

    private int calculateRealisticStat(Position pos, String statType, int ovr) {
        int baseStat = ovr + (random.nextInt(11) - 5);
        int offset = 0;

        switch (statType) {
            case "pace":
                if (pos == Position.LW || pos == Position.RW || pos == Position.LM || pos == Position.RM || pos == Position.LB || pos == Position.RB) offset = 10;
                else if (pos == Position.ST) offset = 5;
                else if (pos == Position.CB) offset = -15;
                else if (pos == Position.GK) offset = -30;
                break;
            case "shooting":
                if (pos == Position.ST || pos == Position.LW || pos == Position.RW || pos == Position.CF) offset = 12;
                else if (pos == Position.CAM) offset = 8;
                else if (pos == Position.CB || pos == Position.LB || pos == Position.RB) offset = -25;
                else if (pos == Position.GK) offset = -50;
                break;
            case "passing":
                if (pos == Position.CM || pos == Position.CAM || pos == Position.CDM) offset = 10;
                else if (pos == Position.ST) offset = -5;
                else if (pos == Position.CB) offset = -10;
                break;
            case "dribbling":
                if (pos == Position.LW || pos == Position.RW || pos == Position.CAM) offset = 12;
                else if (pos == Position.CB) offset = -20;
                else if (pos == Position.GK) offset = -40;
                break;
            case "defending":
                if (pos == Position.CB) offset = 15;
                else if (pos == Position.LB || pos == Position.RB || pos == Position.CDM) offset = 12;
                else if (pos == Position.ST || pos == Position.LW || pos == Position.RW) offset = -30;
                else if (pos == Position.GK) offset = -50;
                break;
            case "physical":
                if (pos == Position.CB || pos == Position.CDM) offset = 12;
                else if (pos == Position.ST) offset = 5;
                else if (pos == Position.LW || pos == Position.RW || pos == Position.CAM) offset = -10;
                break;
            case "gk":
                if (pos == Position.GK) offset = 5;
                break;
        }

        return Math.max(10, Math.min(99, baseStat + offset));
    }

    private Position mapPosition(String strPosition) {
        if (strPosition == null) return Position.CM;
        String pos = strPosition.toLowerCase();
        if (pos.contains("goal") || pos.equals("goalkeeper")) return Position.GK;
        if (pos.contains("defender") || pos.contains("back")) {
            if (pos.contains("left")) return Position.LB;
            if (pos.contains("right")) return Position.RB;
            return Position.CB;
        }
        if (pos.contains("midfield")) {
            if (pos.contains("defensive")) return Position.CDM;
            if (pos.contains("attacking")) return Position.CAM;
            if (pos.contains("left") || pos.contains("wing")) return Position.LM;
            return Position.CM;
        }
        if (pos.contains("forward") || pos.contains("striker") || pos.contains("attacker")) {
            if (pos.contains("left") || pos.contains("wing")) return Position.LW;
            if (pos.contains("right")) return Position.RW;
            return Position.ST;
        }
        return Position.CM;
    }

    private float parseHeight(String heightStr) {
        if (heightStr == null || heightStr.isEmpty()) return 180f;
        try {
            String cleaned = heightStr.replaceAll("[^0-9.]", "");
            float val = Float.parseFloat(cleaned);
            if (val < 3) return val * 100;
            return val;
        } catch (Exception e) {
            return 180f;
        }
    }

    private float parseWeight(String weightStr) {
        if (weightStr == null || weightStr.isEmpty()) return 75f;
        try {
            String cleaned = weightStr.replaceAll("[^0-9.]", "");
            return Float.parseFloat(cleaned);
        } catch (Exception e) {
            return 75f;
        }
    }
}
