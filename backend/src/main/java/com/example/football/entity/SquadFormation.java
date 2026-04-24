package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "squad_formations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SquadFormation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private Users user;

    @Column(columnDefinition = "TEXT")
    private String lineupJson;

    @Column(nullable = false)
    @Builder.Default
    private String formation = "4-3-3";
}
