package com.example.football.repository;

import com.example.football.entity.UserCareer;
import com.example.football.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCareerRepository extends JpaRepository<UserCareer, Long> {
    Optional<UserCareer> findFirstByUserOrderByIdDesc(Users user);
}
