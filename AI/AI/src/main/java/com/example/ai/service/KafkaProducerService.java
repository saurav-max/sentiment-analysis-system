package com.example.ai.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, String>
            kafkaTemplate;

    // define topic name here!
    // one place to change! ✅
    private static final String TOPIC =
            "ai_prediction";

    public KafkaProducerService(
            KafkaTemplate<String, String>
                    kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendPrediction(
            String email, String text) {

        String message = email + "|" + text;

        // use constant! ✅
        kafkaTemplate.send(TOPIC, message);

        System.out.println(
                "Message sent to Kafka: "
                        + message);
    }
}