package com.example.football.service.migration;

import com.example.football.entity.Tournament;
import com.example.football.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MigrationV4_UpdateTournamentNames implements DataMigration {

    private final TournamentRepository tournamentRepository;

    @Override
    public int getVersion() {
        return 4;
    }

    @Override
    public String getDescription() {
        return "Fix: Rename existing tournaments to new tiered naming convention";
    }

    @Override
    public void execute() {
        log.info("MigrationV4: Updating existing tournament names...");
        List<Tournament> tournaments = tournamentRepository.findAll();
        
        for (Tournament t : tournaments) {
            if ("LEAGUE".equals(t.getType())) {
                String newName = getLeagueName(t.getTier());
                if (!t.getName().startsWith(newName)) {
                    log.info("MigrationV4: Updating {} to {}", t.getName(), newName);
                    t.setName(newName);
                    tournamentRepository.save(t);
                }
            }
        }
    }

    private String getLeagueName(int tier) {
        return switch (tier) {
            case 1 -> "Elite Premier League";
            case 2 -> "Championship";
            case 3 -> "National League";
            default -> "Professional League";
        };
    }
}
