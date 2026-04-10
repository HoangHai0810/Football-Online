package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tournament_standings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TournamentStanding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.EAGER) // Eager to avoid lazy load issues on BXH response
    @JoinColumn(name = "ai_club_id")
    private AiClub aiClub;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Users user; // If the row belongs to the user's club

    private boolean isUserTeam;

    @Column(nullable = false)
    @Builder.Default
    private Integer played = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer won = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer drawn = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer lost = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer goalsFor = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer goalsAgainst = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 0;

    public Integer getGoalDifference() {
        return this.goalsFor - this.goalsAgainst;
    }
}
