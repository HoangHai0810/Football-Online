package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "match_fixtures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchFixture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Tournament tournament;

    @Column(nullable = false)
    private Integer matchWeek; // e.g. 1, 2, 3... 38

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "home_ai_club_id")
    private AiClub homeAiClub;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "away_ai_club_id")
    private AiClub awayAiClub;

    @Column(nullable = false)
    @Builder.Default
    private boolean homeIsUser = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean awayIsUser = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_user_id")
    private Users homeUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "away_user_id")
    private Users awayUser;

    private Integer homeScore;
    private Integer awayScore;

    @Column(nullable = false)
    @Builder.Default
    private boolean isPlayed = false;
}
