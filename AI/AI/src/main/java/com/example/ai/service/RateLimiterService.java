package com.example.ai.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimiterService {

    private final RedisTemplate<String, Object>
            redisTemplate;

    private static final int MAX_REQUESTS = 20;
    private static final int WINDOW_SECONDS = 60;

    public RateLimiterService(
            RedisTemplate<String, Object>
                    redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isAllowed(String email) {
        try {
            String key = "rate_limit:" + email;

            Object value = redisTemplate
                    .opsForValue()
                    .get(key);

            System.out.println(
                    "Rate limit check → key: " + key
                            + " value: " + value);

            // FIRST REQUEST
            // key doesn't exist yet!
            if (value == null) {
                redisTemplate.opsForValue()
                        .set(
                                key,
                                "1",        // store as String!
                                WINDOW_SECONDS,
                                TimeUnit.SECONDS
                        );
                System.out.println(
                        "Rate limit started: "
                                + email + " [1/"
                                + MAX_REQUESTS + "]");
                return true;
            }

            // SUBSEQUENT REQUESTS
            int requests = Integer.parseInt(
                    value.toString()
            );

            System.out.println(
                    "Current count: " + requests);

            if (requests < MAX_REQUESTS) {

                // FIX: increment AND
                // reset TTL together!
                redisTemplate.opsForValue()
                        .set(
                                key,
                                String.valueOf(requests + 1),
                                // get remaining TTL!
                                redisTemplate.getExpire(
                                        key,
                                        TimeUnit.SECONDS
                                ),
                                TimeUnit.SECONDS
                        );

                System.out.println(
                        "Rate limit count: "
                                + email + " ["
                                + (requests + 1)
                                + "/" + MAX_REQUESTS + "]");
                return true;
            }

            // LIMIT EXCEEDED
            Long ttl = redisTemplate
                    .getExpire(
                            key,
                            TimeUnit.SECONDS
                    );
            System.out.println(
                    "Rate limit EXCEEDED: "
                            + email + " ["
                            + requests + "/"
                            + MAX_REQUESTS + "]"
                            + " resets in: " + ttl + "s");
            return false;

        } catch (Exception e) {
            System.out.println(
                    "Rate limit ERROR: "
                            + e.getMessage());
            e.printStackTrace();
            // allow request if Redis fails!
            return true;
        }
    }

    public int getRemaining(String email) {
        try {
            String key = "rate_limit:" + email;
            Object value = redisTemplate
                    .opsForValue()
                    .get(key);
            if (value == null)
                return MAX_REQUESTS;
            int used = Integer.parseInt(
                    value.toString()
            );
            return Math.max(
                    0, MAX_REQUESTS - used
            );
        } catch (Exception e) {
            System.out.println(
                    "getRemaining ERROR: "
                            + e.getMessage());
            return MAX_REQUESTS;
        }
    }
}