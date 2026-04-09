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

    // JSON string storing the lineup mapping: slotIndex (0-10) -> playerCardId
    // e.g., {"0": 101, "1": 205, "2": 30}
    @Column(columnDefinition = "TEXT")
    private String lineupJson;

    @Column(nullable = false)
    @Builder.Default
    private String formation = "4-3-3";
}
