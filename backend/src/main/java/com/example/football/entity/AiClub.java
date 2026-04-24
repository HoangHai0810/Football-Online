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
    private Integer leagueTier = 1;

    @Column(nullable = false)
    private Integer baseOvr;

    @Column(columnDefinition = "TEXT")
    private String starPlayers;
}
