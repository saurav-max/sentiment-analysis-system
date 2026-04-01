package com.example.ai.repository;

import com.example.ai.model.AIResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AIResultRepository extends JpaRepository<AIResult, Long> {

    List<AIResult> findByEmail(String email);
}