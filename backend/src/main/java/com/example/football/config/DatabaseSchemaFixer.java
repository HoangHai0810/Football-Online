package com.example.football.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("Starting production database schema fix...");

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
                log.warn("Could not drop constraint: {} - it might not exist or table might not be ready yet. Error: {}", 
                    constraint, e.getMessage());
            }
        }
        
        log.info("Schema fix process completed.");
    }
}
