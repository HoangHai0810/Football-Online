package com.example.football.repository;

import com.example.football.entity.TopupOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TopupOrderRepository extends JpaRepository<TopupOrder, Long> {
    Optional<TopupOrder> findByOrderCode(Long orderCode);
}
