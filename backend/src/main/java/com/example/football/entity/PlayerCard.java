package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "player_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "template_id", nullable = false)
    private PlayerTemplate template;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users owner;

    @Builder.Default
    @Column(nullable = false)
    private Integer upgradeLevel = 1;

    // Derived stats or special individual stats could go here
    // For now, it mainly just points to a template and has a level.

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
