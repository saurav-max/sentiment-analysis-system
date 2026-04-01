package com.example.ai.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class RefreshToken {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    private String token;
    private String email;
    private LocalDateTime expiryDate;

    // ADD ROLE! ✅
    private String role;

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }
    public void setExpiryDate(
            LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    // ADD ROLE GETTER SETTER! ✅
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
}