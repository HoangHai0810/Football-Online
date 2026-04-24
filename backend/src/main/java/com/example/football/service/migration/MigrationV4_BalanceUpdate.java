package com.example.football.service.migration;

import com.example.football.entity.PlayerTemplate;
import com.example.football.entity.Season;
import com.example.football.repository.PlayerTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class MigrationV4_BalanceUpdate implements DataMigration {

    private final PlayerTemplateRepository playerTemplateRepository;

    @Override
    public int getVersion() {
        return 4;
    }

    @Override
    public String getDescription() {
        return "Balance Update: Normalizing OVRs (Max ICON 110, Max LIVE 102) and fixing misclassified seasons.";
    }

    @Override
    @Transactional
    public void execute() {
        log.info("MigrationV4: Starting database balance update and cleanup...");

        playerTemplateRepository.findAll().stream()
                .filter(p -> p.getSeason() == Season.ICON && p.getOvr() > 110)
                .forEach(p -> {
                    log.info("MigrationV4: Normalizing ICON {} from {} to 110", p.getName(), p.getOvr());
                    p.setOvr(110);
                    normalizeStats(p, 115);
                    playerTemplateRepository.save(p);
                });

        playerTemplateRepository.findAll().stream()
                .filter(p -> p.getSeason() != Season.ICON && p.getOvr() > 102)
                .forEach(p -> {
                    log.info("MigrationV4: Normalizing {} season player {} from {} to 102", p.getSeason(), p.getName(), p.getOvr());
                    p.setOvr(102);
                    normalizeStats(p, 108);
                    playerTemplateRepository.save(p);
                });

        log.info("MigrationV4: Database balance update completed.");
    }

    private void normalizeStats(PlayerTemplate p, int limit) {
        if (p.getPace() > limit) p.setPace(limit);
        if (p.getShooting() > limit) p.setShooting(limit);
        if (p.getPassing() > limit) p.setPassing(limit);
        if (p.getDribbling() > limit) p.setDribbling(limit);
        if (p.getDefending() > limit) p.setDefending(limit);
        if (p.getPhysical() > limit) p.setPhysical(limit);
        
        if (p.getAcceleration() != null && p.getAcceleration() > limit + 5) p.setAcceleration(limit + 5);
        if (p.getSprintSpeed() != null && p.getSprintSpeed() > limit) p.setSprintSpeed(limit);
    }
}
