package com.example.ai.controller;

import com.example.ai.config.JwtUtil;
import com.example.ai.dto.*;
import com.example.ai.model.User;
import com.example.ai.service.RefreshTokenService;
import com.example.ai.service.UserService;
import org.springframework.security.core
        .Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final RefreshTokenService
            refreshTokenService;
    private final JwtUtil jwtUtil;

    public UserController(
            UserService userService,
            RefreshTokenService refreshTokenService,
            JwtUtil jwtUtil) {
        this.userService = userService;
        this.refreshTokenService =
                refreshTokenService;
        this.jwtUtil = jwtUtil;
    }

    // REGISTER (unchanged)
    @PostMapping("/register")
    public ApiResponse<UserResponseDto> register(
            @RequestBody User user) {

        UserResponseDto response =
                userService.register(user);

        return new ApiResponse<>(
                "User registered successfully",
                response
        );
    }

    // LOGIN (unchanged)
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
            @RequestBody User user) {

        AuthResponse response =
                userService.login(
                        user.getEmail(),
                        user.getPassword()
                );

        return new ApiResponse<>(
                "Login successful",
                response
        );
    }

    // REFRESH TOKEN (FIXED!) ✅
    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refreshToken(
            @RequestParam String refreshToken) {

        var token = refreshTokenService
                .verifyToken(refreshToken);

        // FIXED: use role from token! ✅
        // NOT hardcoded "USER"!
        String newAccessToken =
                jwtUtil.generateToken(
                        token.getEmail(),
                        token.getRole() // ✅ correct role!
                );

        return new ApiResponse<>(
                "Token refreshed",
                new AuthResponse(
                        newAccessToken,
                        refreshToken
                )
        );
    }

    // LOGOUT (unchanged)
    @PostMapping("/logout")
    public ApiResponse<String> logout(
            @RequestParam String refreshToken) {

        refreshTokenService
                .deleteToken(refreshToken);

        return new ApiResponse<>(
                "Logout successful",
                "Session ended"
        );
    }

    // PROFILE (unchanged)
    @GetMapping("/profile")
    public ApiResponse<String> profile(
            Authentication authentication) {

        return new ApiResponse<>(
                "Profile fetched",
                authentication.getName()
        );
    }
}