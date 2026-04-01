package com.example.ai.service;

import com.example.ai.model.RefreshToken;
import com.example.ai.repository
        .RefreshTokenRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository
            repository;

    public RefreshTokenService(
            RefreshTokenRepository repository) {
        this.repository = repository;
    }

    // UPDATED: add role parameter! ✅
    public RefreshToken createRefreshToken(
            String email,
            String role) { // ← ADD role! ✅

        RefreshToken token = new RefreshToken();
        token.setEmail(email);
        token.setRole(role); // ← SAVE role! ✅
        token.setToken(
                UUID.randomUUID().toString()
        );
        token.setExpiryDate(
                LocalDateTime.now().plusDays(7)
        );

        return repository.save(token);
    }

    // verify token (unchanged)
    public RefreshToken verifyToken(
            String token) {

        RefreshToken refreshToken =
                repository.findByToken(token)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid refresh token"
                                )
                        );

        if (refreshToken.getExpiryDate()
                .isBefore(LocalDateTime.now())) {
            throw new RuntimeException(
                    "Refresh token expired"
            );
        }

        return refreshToken;
    }

    public void deleteToken(String token) {
        repository.deleteByToken(token);
    }

    public void deleteUserTokens(String email) {
        repository.deleteByEmail(email);
    }
}