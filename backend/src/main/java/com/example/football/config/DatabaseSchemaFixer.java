package com.example.football.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DatabaseSchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("Starting production database schema fix (Deferred to Post-Startup)...");

        String[] constraints = {
            "players_season_check",
            "players_position_check",
            "players_body_type_check"
        };

        for (String constraint : constraints) {
            try {
                log.info("Attempting to drop constraint: {} if exists", constraint);
                jdbcTemplate.execute("ALTER TABLE players DROP CONSTRAINT IF EXISTS " + constraint);
            } catch (Exception e) {
                log.warn("Could not drop constraint: {} - it might not exist or table might not be ready yet.", constraint);
            }
        }

        // Add missing columns to tournaments table with defaults
        String[] tournamentCols = {
            "ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 1",
            "ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS season_index INTEGER DEFAULT 1",
            "ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false",
            "ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS is_eliminated BOOLEAN DEFAULT false"
        };

        for (String sql : tournamentCols) {
            try {
                log.info("Executing schema fix: {}", sql);
                jdbcTemplate.execute(sql);
            } catch (Exception e) {
                log.warn("Could not execute schema fix: {} - Error: {}", sql, e.getMessage());
            }
        }
        
        log.info("Schema fix process completed.");
    }
}
