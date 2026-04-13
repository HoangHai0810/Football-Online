package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tournament_player_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TournamentPlayerStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Tournament tournament;

    private Long playerCardId; 
    private String playerName;
    private String clubName;
    private String playerPosition;

    @Builder.Default
    private Integer goals = 0;

    @Builder.Default
    private Integer assists = 0;
    
    @Builder.Default
    private Integer played = 0;
}
