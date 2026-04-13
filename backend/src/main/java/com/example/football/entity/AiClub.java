package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_clubs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiClub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Integer leagueTier = 1; // 1: Top Division, 2: Second Division

    @Column(nullable = false)
    private Integer baseOvr; // Used to simulate matches

    @Column(columnDefinition = "TEXT")
    private String starPlayers; // Comma-separated names
}
