package com.example.ai.util;

import java.security.MessageDigest;

public class HashUtil {

    public static String hashText(String text) {
        try {

            MessageDigest md = MessageDigest.getInstance("MD5");

            byte[] digest = md.digest(text.getBytes());

            StringBuilder sb = new StringBuilder();

            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }

            return sb.toString();

        } catch (Exception e) {
            throw new RuntimeException("Hash generation failed");
        }
    }
}