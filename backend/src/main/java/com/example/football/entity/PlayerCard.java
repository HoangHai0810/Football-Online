package com.example.football.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PlayerCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "template_id", nullable = false)
    private PlayerTemplate template;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Users owner;

    @Builder.Default
    @Column(nullable = false)
    private Integer upgradeLevel = 1;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Transient
    public int getEffectiveOvr() {
        int baseOvr = template != null && template.getOvr() != null ? template.getOvr() : 0;
        return baseOvr + getStatBonus();
    }

    @Transient
    public int getStatBonus() {
        return switch (upgradeLevel) {
            case 2 -> 1;
            case 3 -> 2;
            case 4 -> 4;
            case 5 -> 6;
            case 6 -> 8;
            case 7 -> 11;
            case 8 -> 15;
            case 9 -> 18;
            case 10 -> 21;
            default -> 0; // level 1 and above 10 if customized
        };
    }
}
