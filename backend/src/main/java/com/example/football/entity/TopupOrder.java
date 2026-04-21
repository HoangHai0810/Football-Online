package com.example.football.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "topup_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopupOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long orderCode;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer coinsAmount;

    @Column(nullable = false)
    private Integer priceVnd;

    @Column(nullable = false)
    private String status; // PENDING, SUCCESS, FAILED

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
