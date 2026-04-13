package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
    @JsonIgnore
    private Tournament tournament;

    @JsonProperty("tournamentId")
    public Long getTournamentId() {
        return tournament != null ? tournament.getId() : null;
    }

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

    @Column(name = "is_played", nullable = false)
    @Builder.Default
    private boolean played = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean isKnockout = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean extraTimeUsed = false;

    private Integer homePenaltyScore;
    private Integer awayPenaltyScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_user_id")
    @JsonIgnore
    private Users homeUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "away_user_id")
    @JsonIgnore
    private Users awayUser;

    private Integer homeScore;
    private Integer awayScore;

    public boolean isUserWinner() {
        if (!played) return false;
        if (homeIsUser) {
            if (homeScore > awayScore) return true;
            if (homePenaltyScore != null && homePenaltyScore > awayPenaltyScore) return true;
        } else if (awayIsUser) {
            if (awayScore > homeScore) return true;
            if (awayPenaltyScore != null && awayPenaltyScore > homePenaltyScore) return true;
        }
        return false;
    }

    public AiClub getWinnerAiClub() {
        if (!played) return null;
        if (isUserWinner()) return null;
        
        if (homeScore > awayScore) return homeAiClub;
        if (awayScore > homeScore) return awayAiClub;
        if (homePenaltyScore != null && homePenaltyScore > awayPenaltyScore) return homeAiClub;
        if (awayPenaltyScore != null && awayPenaltyScore > homePenaltyScore) return awayAiClub;
        
        return null;
    }
}
