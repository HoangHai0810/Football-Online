package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "missions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MissionType type;

    @Column(nullable = false)
    private Integer targetAmount;

    @Column(nullable = false)
    private Long rewardCoins;

    private String rewardPackId;

    @Builder.Default
    private boolean rewardLuckyBp = false;
    
    @Builder.Default
    private boolean isActive = true;
}
