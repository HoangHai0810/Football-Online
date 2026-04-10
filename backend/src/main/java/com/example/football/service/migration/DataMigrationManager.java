package com.example.football.service.migration;

import com.example.football.entity.SystemSetting;
import com.example.football.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Order(Ordered.LOWEST_PRECEDENCE)
public class DataMigrationManager implements CommandLineRunner {

    private final SystemSettingRepository systemSettingRepository;
    private final List<DataMigration> migrations;

    private static final String DATA_VERSION_KEY = "data_version";

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        int currentVersion = getCurrentVersion();
        
        log.info("DataMigrationManager: Current data version is {}", currentVersion);

        // Run migrations in order
        migrations.stream()
                .filter(m -> m.getVersion() > currentVersion)
                .sorted((a, b) -> Integer.compare(a.getVersion(), b.getSeconds())) // sorted by version
                .forEach(this::runMigration);
    }

    private void runMigration(DataMigration migration) {
        log.info("DataMigrationManager: Running migration Version {} - {}", migration.getVersion(), migration.getDescription());
        try {
            migration.execute();
            updateVersion(migration.getVersion());
            log.info("DataMigrationManager: Successfully completed migration Version {}", migration.getVersion());
        } catch (Exception e) {
            log.error("DataMigrationManager: Failed to run migration Version {}", migration.getVersion(), e);
            throw new RuntimeException("Migration failed", e);
        }
    }

    private int getCurrentVersion() {
        return systemSettingRepository.findById(DATA_VERSION_KEY)
                .map(s -> Integer.parseInt(s.getSettingValue()))
                .orElse(0);
    }

    private void updateVersion(int version) {
        SystemSetting setting = systemSettingRepository.findById(DATA_VERSION_KEY)
                .orElse(new SystemSetting(DATA_VERSION_KEY, "0"));
        setting.setSettingValue(String.valueOf(version));
        systemSettingRepository.save(setting);
    }
}
