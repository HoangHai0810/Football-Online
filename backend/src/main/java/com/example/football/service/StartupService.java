package com.example.football.service;

import com.example.football.entity.*;
import com.example.football.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StartupService {

    private final PlayerTemplateRepository playerTemplateRepository;
    private final PlayerCardRepository playerCardRepository;
    private final SquadFormationRepository squadFormationRepository;
    private final SeasonGeneratorService seasonGeneratorService;

    @Transactional
    public void initializeNewUser(Users user) {
        List<PlayerTemplate> templates = playerTemplateRepository.findAll();
        List<PlayerTemplate> starters = templates.stream()
                .filter(p -> p.getOvr() >= 60 && p.getOvr() <= 80)
                .collect(Collectors.toList());
        
        Collections.shuffle(starters);
        List<PlayerTemplate> selectedStarters = starters.stream().limit(11).collect(Collectors.toList());

        List<PlayerCard> cards = new ArrayList<>();
        for (PlayerTemplate template : selectedStarters) {
            cards.add(playerCardRepository.save(PlayerCard.builder()
                    .owner(user)
                    .template(template)
                    .upgradeLevel(1)
                    .build()));
        }

        Map<String, Long> lineup = new HashMap<>();

        for (int i = 0; i < cards.size(); i++) {
            if (i < 11) {
                lineup.put(String.valueOf(i), cards.get(i).getId());
            }
        }

        try {
            tools.jackson.databind.ObjectMapper mapper = new tools.jackson.databind.ObjectMapper();
            String lineupJson = mapper.writeValueAsString(lineup);
            
            squadFormationRepository.save(SquadFormation.builder()
                    .user(user)
                    .formation("4-3-3")
                    .lineupJson(lineupJson)
                    .build());
        } catch (Exception e) {

        }

        seasonGeneratorService.createNewSeason(user);
    }
}
