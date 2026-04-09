package com.example.football.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "players")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PlayerTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Position position;

    @Column(nullable = false)
    private int age;

    @Column(nullable = false)
    private float height;

    @Column(nullable = false)
    private float weight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BodyType bodyType;

    @Column(nullable = true)
    private String nationality;

    @Column(nullable = true)
    private String club;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Season season;

    // Face Stats
    private Integer pace;
    private Integer shooting;
    private Integer passing;
    private Integer dribbling;
    private Integer defending;
    private Integer physical;

    // PAC Components
    private Integer acceleration;
    private Integer sprintSpeed;

    // SHO Components
    private Integer finishing;
    private Integer shotPower;
    private Integer longShot;
    private Integer positioning;
    private Integer volleys;

    // PAS Components
    private Integer shortPassing;
    private Integer longPassing;
    private Integer vision;
    private Integer crossing;
    private Integer curve;

    // DRI Components
    private Integer dribblingStat; 
    private Integer ballControl;
    private Integer agility;
    private Integer balance;
    private Integer reactions;

    // DEF Components
    private Integer interceptions;
    private Integer marking;
    private Integer standingTackle;
    private Integer slidingTackle;

    // PHY Components
    private Integer strength;
    private Integer aggression;
    private Integer stamina;
    private Integer jumping;
    private Integer heading;

    // GK Stats
    private Integer diving;
    private Integer reflexes;
    private Integer handling;
    private Integer gkPositioning;
    private Integer kicking;

    // Metadata
    @Enumerated(EnumType.STRING)
    private WorkRate attackingWorkRate;

    @Enumerated(EnumType.STRING)
    private WorkRate defensiveWorkRate;

    @ElementCollection
    @CollectionTable(name = "player_traits", joinColumns = @JoinColumn(name = "player_id"))
    @Column(name = "trait")
    private List<String> traits;

    @Column(nullable = false)
    private Integer ovr;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
