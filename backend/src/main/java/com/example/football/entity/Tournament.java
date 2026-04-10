package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tournaments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g. "Elite Premier League"

    @Column(nullable = false)
    private String type; // "LEAGUE", "CUP", "SUPER_CUP", "CONTINENTAL"

    @Column(nullable = false)
    private Integer seasonIndex;

    @Column(nullable = false)
    @Builder.Default
    private Integer tier = 1; // 1, 2, 3 for Leagues; 0 for Cups

    @Column(nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isEliminated = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Users user; // Which user does this instance belong to?
}
