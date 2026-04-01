package com.example.ai.controller;

import com.example.ai.model.AIResult;
import com.example.ai.repository.AIResultRepository;
import com.example.ai.service.KafkaProducerService;
import com.example.ai.service.RateLimiterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AIController {

    private final KafkaProducerService
            kafkaProducerService;
    private final AIResultRepository repository;
    private final RateLimiterService
            rateLimiterService;

    public AIController(
            KafkaProducerService kafkaProducerService,
            AIResultRepository repository,
            RateLimiterService rateLimiterService) {
        this.kafkaProducerService =
                kafkaProducerService;
        this.repository = repository;
        this.rateLimiterService = rateLimiterService;
    }

    @PostMapping("/predict")
    public ResponseEntity<?> predict(
            @RequestParam String text,
            Authentication authentication) {

        String email = authentication.getName();

        System.out.println(
                "Predict request from: " + email
                        + " text: " + text);

        try {

            // validate text
            if (text == null ||
                    text.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("message",
                                "Text cannot be empty!"));
            }

            // add log before rate limit!
            System.out.println(
                    "Checking rate limit for: "
                            + email);

            // check rate limit
            if (!rateLimiterService
                    .isAllowed(email)) {
                return ResponseEntity
                        .status(HttpStatus
                                .TOO_MANY_REQUESTS)
                        .body(Map.of(
                                "message",
                                "Too many requests! " +
                                        "Please wait 60 seconds!",
                                "remainingRequests", 0
                        ));
            }

            // normalize text
            String normalized = text
                    .trim()
                    .toLowerCase()
                    .replaceAll("\\s+", " ");

            System.out.println(
                    "Normalized: " + normalized);

            // send to kafka
            kafkaProducerService
                    .sendPrediction(email, normalized);

            int remaining = rateLimiterService
                    .getRemaining(email);

            System.out.println(
                    "Job submitted! Remaining: "
                            + remaining);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Prediction job submitted!",
                            "remainingRequests", remaining
                    )
            );

        } catch (Exception e) {
            // catches ALL silent errors!
            System.out.println(
                    "ERROR in predict: "
                            + e.getMessage());
            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus
                            .INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Error: " + e.getMessage()
                    ));
        }
    }
    @GetMapping("/history")
    public ResponseEntity<?> history(
            Authentication authentication) {

        String email = authentication.getName();

        List<AIResult> results =
                repository.findByEmail(email);

        return ResponseEntity.ok(
                Map.of(
                        "message", "History fetched",
                        "data", results
                )
        );
    }
}