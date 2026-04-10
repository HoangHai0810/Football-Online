package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_careers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCareer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Users user;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentSeason = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentWeek = 1;
}
