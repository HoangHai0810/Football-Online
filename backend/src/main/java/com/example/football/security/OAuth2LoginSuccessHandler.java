package com.example.football.security;

import com.example.football.entity.Users;
import com.example.football.repository.UserRepository;
import com.example.football.service.StartupService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final StartupService startupService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");

        if (email == null || googleId == null) {
            log.error("OAuth2 login failed: email or googleId is null");
            response.sendRedirect(frontendUrl + "/login?error=oauth_failed");
            return;
        }

        Users user = userRepository.findByProviderIdAndProvider(googleId, "google")
                .orElseGet(() -> {
                    return userRepository.findByEmail(email)
                            .map(existingUser -> {
                                existingUser.setProvider("google");
                                existingUser.setProviderId(googleId);
                                return userRepository.save(existingUser);
                            })
                            .orElseGet(() -> {
                                String username = generateUniqueUsername(name, email);
                                Users  newUser  = Users.builder()
                                        .email(email)
                                        .username(username)
                                        .password(UUID.randomUUID().toString())
                                        .provider("google")
                                        .providerId(googleId)
                                        .coins(30000L)
                                        .clubName("FC ARENA")
                                        .role("ROLE_USER")
                                        .build();
                                
                                Users savedUser = userRepository.save(newUser);

                                startupService.initializeNewUser(savedUser);
                                
                                return savedUser;
                            });
                });

        String token = jwtUtils.generateToken(user);
        log.info("OAuth2 login success for user: {}", user.getUsername());

        response.sendRedirect(frontendUrl + "/login-success?token=" + token);
    }

    private String generateUniqueUsername(String name, String email) {
        String base = (name != null && !name.isBlank())
                ? name.toLowerCase().replaceAll("[^a-z0-9]", "")
                :   email.split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "");

        if (base.isBlank()) base = "player";

        String candidate = base;
        int    attempt   = 0;
        while (userRepository.findByUsername(candidate).isPresent()) {
            attempt++;
            candidate = base + attempt;
        }
        return candidate;
    }
}
