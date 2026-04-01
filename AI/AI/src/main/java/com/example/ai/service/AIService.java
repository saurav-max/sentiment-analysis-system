package com.example.ai.service;

import com.example.ai.dto.PredictionRequest;
import com.example.ai.dto.PredictionResponse;
import com.example.ai.model.AIResult;
import com.example.ai.repository.AIResultRepository;

import com.example.ai.util.HashUtil;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class AIService {

    private final AIResultRepository repository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RestTemplate restTemplate = new RestTemplate();

    public AIService(AIResultRepository repository,
                     RedisTemplate<String, Object> redisTemplate) {
        this.repository = repository;
        this.redisTemplate = redisTemplate;
    }

    public PredictionResponse getPrediction(String email, String text) {

        String normalized = text.trim().toLowerCase().replaceAll("\\s+", " ");

        String hash = HashUtil.hashText(normalized);

        String key = "prediction:" + hash;

        // 1️⃣ Check Redis Cache
        Object cached = redisTemplate.opsForValue().get(key);

        if (cached != null) {
            System.out.println("Cache HIT from Redis");

            return (PredictionResponse) cached;
        }

        System.out.println("Cache MISS → calling AI service");

        // 2️⃣ Call FastAPI AI
        String url = "http://localhost:8000/predict";

        PredictionRequest request = new PredictionRequest();
        request.setText(text);

        PredictionResponse response =
                restTemplate.postForObject(url, request, PredictionResponse.class);

        // 3️⃣ Save in Redis Cache (TTL 1 hour)
        redisTemplate.opsForValue().set(key, response, 1, TimeUnit.HOURS);

        // 4️⃣ Save prediction in database
        AIResult result = new AIResult();
        result.setEmail(email);
        result.setInputText(text);
        result.setPrediction(response.getPrediction());
        result.setConfidence(response.getConfidence());
        result.setCreatedAt(LocalDateTime.now());

        repository.save(result);

        return response;
    }
}