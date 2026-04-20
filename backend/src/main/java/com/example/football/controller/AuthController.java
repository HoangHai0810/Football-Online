package com.example.football.controller;

import com.example.football.dto.AuthRequest;
import com.example.football.dto.AuthResponse;
import com.example.football.dto.MessageResponse;
import com.example.football.entity.Users;
import com.example.football.entity.MissionType;
import com.example.football.repository.UserRepository;
import com.example.football.service.MissionService;
import com.example.football.service.StartupService;
import com.example.football.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final MissionService missionService;
    private final StartupService startupService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        Users user = Users.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .coins(50000L)
                .role("ROLE_USER")
                .build();

        userRepository.save(user);
        startupService.initializeNewUser(user);
        
        String token = jwtUtils.generateToken(user);
        
        try {
            missionService.updateProgress(user.getUsername(), MissionType.LOGIN_DAILY, 1);
        } catch (Exception e) {}

        return ResponseEntity.ok(AuthResponse.builder().token(token).email(user.getEmail()).build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Users user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + request.getUsername()));
        
        String token = jwtUtils.generateToken(user);
        
        try {
            missionService.updateProgress(user.getUsername(), MissionType.LOGIN_DAILY, 1);
        } catch (Exception e) {}

        return ResponseEntity.ok(AuthResponse.builder().token(token).email(user.getEmail()).build());
    }
}
