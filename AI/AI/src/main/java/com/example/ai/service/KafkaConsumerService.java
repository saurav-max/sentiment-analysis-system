package com.example.ai.service;

import com.example.ai.dto.PredictionRequest;
import com.example.ai.dto.PredictionResponse;
import com.example.ai.model.AIResult;
import com.example.ai.repository.AIResultRepository;
import org.springframework.data.redis.core
        .RedisTemplate;
import org.springframework.kafka.annotation
        .KafkaListener;
import org.springframework.messaging.simp
        .SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class KafkaConsumerService {

    private final AIResultRepository repository;
    private final RedisTemplate<String, Object>
            redisTemplate;
    private final SimpMessagingTemplate
            messagingTemplate;
    private final RestTemplate restTemplate =
            new RestTemplate();

    public KafkaConsumerService(
            AIResultRepository repository,
            RedisTemplate<String, Object>
                    redisTemplate,
            SimpMessagingTemplate messagingTemplate) {
        this.repository = repository;
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(
            topics = "ai_prediction",
            groupId = "ai-group"
    )
    public void consumePrediction(
            String message) {

        System.out.println(
                "=================================");
        System.out.println(
                "Received message from Kafka: "
                        + message);
        System.out.println(
                "=================================");

        try {
            String[] parts = message.split("\\|");
            String email = parts[0];
            String text  = parts[1];

            String normalized = text
                    .trim()
                    .toLowerCase()
                    .replaceAll("\\s+", " ");

            System.out.println(
                    "Processing: " + email
                            + " | " + normalized);

            String key = "prediction:" + normalized;

            String prediction = null;
            Double confidence = null;
            boolean fromCache = false;

            // CHECK REDIS!
            Object cached = redisTemplate
                    .opsForValue()
                    .get(key);

            System.out.println(
                    "Redis raw value: " + cached);

            // validate cached value!
            if (cached != null) {
                String cachedStr =
                        cached.toString();

                if (cachedStr.contains("|")
                        && !cachedStr.contains(
                        "PredictionResponse")) {

                    String[] cachedParts =
                            cachedStr.split("\\|");

                    if (cachedParts.length >= 2) {
                        prediction = cachedParts[0];
                        confidence = Double
                                .parseDouble(
                                        cachedParts[1]
                                );
                        fromCache = true;

                        System.out.println(
                                "⚡ Redis CACHE HIT!"
                                        + " prediction: "
                                        + prediction
                                        + " confidence: "
                                        + confidence);
                    } else {
                        System.out.println(
                                "Bad cache format!"
                                        + " Deleting!");
                        redisTemplate.delete(key);
                        cached = null;
                    }
                } else {
                    System.out.println(
                            "Old object in Redis!"
                                    + " Deleting!");
                    redisTemplate.delete(key);
                    cached = null;
                }
            }

            // CALL AI if no valid cache!
            if (!fromCache) {
                System.out.println(
                        "❌ Redis CACHE MISS"
                                + " → calling AI");

                String url =
                        "http://localhost:8000/predict";

                PredictionRequest request =
                        new PredictionRequest();
                request.setText(normalized);

                PredictionResponse response =
                        restTemplate.postForObject(
                                url,
                                request,
                                PredictionResponse.class
                        );

                prediction =
                        response.getPrediction();
                confidence =
                        response.getConfidence();

                String cacheValue =
                        prediction + "|" + confidence;

                redisTemplate.opsForValue()
                        .set(
                                key,
                                cacheValue,
                                1,
                                TimeUnit.HOURS
                        );

                System.out.println(
                        "Saved to Redis: "
                                + key + " = " + cacheValue);
            }

            // save to DB only on cache miss!
            if (!fromCache) {
                AIResult result = new AIResult();
                result.setEmail(email);
                result.setInputText(normalized);
                result.setPrediction(prediction);
                result.setConfidence(confidence);
                result.setCreatedAt(
                        LocalDateTime.now());

                repository.save(result);
                System.out.println(
                        "Saved to database ✅");
            } else {
                System.out.println(
                        "Cache hit → skip DB ✅");
            }

            // push to WebSocket!
            AIResult wsResult = new AIResult();
            wsResult.setEmail(email);
            wsResult.setInputText(normalized);
            wsResult.setPrediction(prediction);
            wsResult.setConfidence(confidence);
            wsResult.setCreatedAt(
                    LocalDateTime.now());

            // FIX: manual path! ✅
            // no Spring Security needed!
            messagingTemplate
                    .convertAndSend(
                            "/user/" + email +
                                    "/queue/predictions", // ✅
                            wsResult
                    );

            System.out.println(
                    "WebSocket pushed → "
                            + email + " | "
                            + prediction + " | "
                            + confidence);

        } catch (Exception e) {
            System.out.println(
                    "Consumer ERROR: "
                            + e.getMessage());
            e.printStackTrace();
        }
    }
}