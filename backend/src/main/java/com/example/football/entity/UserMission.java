package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_missions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "mission_id", nullable = false)
    private Mission mission;

    @Builder.Default
    private Integer currentAmount = 0;

    @Builder.Default
    private boolean completed = false;

    @Builder.Default
    private boolean claimed = false;

    @UpdateTimestamp
    private LocalDateTime lastUpdate;
    
    private LocalDateTime nextResetAt;
}
