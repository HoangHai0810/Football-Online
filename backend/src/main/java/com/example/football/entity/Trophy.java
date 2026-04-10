package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trophies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trophy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Users user;

    @Column(nullable = false)
    private String tournamentName;

    @Column(nullable = false)
    private Integer seasonIndex;

    @Column(nullable = false)
    private String rank; // "WINNER", "RUNNER_UP", "TOP_4"

    @Builder.Default
    private LocalDateTime wonAt = LocalDateTime.now();
}
