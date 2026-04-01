package com.example.ai.service;

import com.example.ai.config.JwtUtil;
import com.example.ai.dto.AuthResponse;
import com.example.ai.dto.UserResponseDto;
import com.example.ai.exception
        .UserNotFoundException;
import com.example.ai.model.User;
import com.example.ai.repository.UserRepository;
import org.springframework.security.crypto
        .bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder
            passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService
            refreshTokenService;

    public UserService(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            RefreshTokenService
                    refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService =
                refreshTokenService;
    }

    public UserResponseDto register(User user) {
        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );
        user.setRole("USER");

        User savedUser =
                userRepository.save(user);

        return new UserResponseDto(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    public AuthResponse login(
            String email,
            String password) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(email)
                );

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {
            throw new RuntimeException(
                    "Invalid password"
            );
        }

        String accessToken =
                jwtUtil.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        // UPDATED: pass role! ✅
        String refreshToken =
                refreshTokenService
                        .createRefreshToken(
                                email,
                                user.getRole() // ← ADD role! ✅
                        )
                        .getToken();

        return new AuthResponse(
                accessToken,
                refreshToken
        );
    }
}