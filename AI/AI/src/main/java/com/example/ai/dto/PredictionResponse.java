package com.example.ai.dto;

import java.io.Serializable;

public class PredictionResponse implements Serializable {

    private String prediction;
    private double confidence;

    public String getPrediction() {
        return prediction;
    }

    public void setPrediction(String prediction) {
        this.prediction = prediction;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
}