package com.example.ai.dto;

import java.io.Serializable;

public class PredictionRequest implements Serializable {

    private String text;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}