package com.example.ai.config;

import com.example.ai.config.JwtUtil;
import org.springframework.context.annotation
        .Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config
        .ChannelRegistration;
import org.springframework.messaging.simp.config
        .MessageBrokerRegistry;
import org.springframework.messaging.simp
        .stomp.StompCommand;
import org.springframework.messaging.simp
        .stomp.StompHeaderAccessor;
import org.springframework.messaging.support
        .ChannelInterceptor;
import org.springframework.messaging.support
        .MessageHeaderAccessor;
import org.springframework.security.authentication
        .UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config
        .annotation.*;

import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements
        WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;

    public WebSocketConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry config) {
        config.enableSimpleBroker(
                "/topic",
                "/queue"
        );
        config.setApplicationDestinationPrefixes(
                "/app"
        );
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    // THIS IS THE KEY FIX! ✅
    // Sets WebSocket user from JWT token!
    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration) {
        registration.interceptors(
                new ChannelInterceptor() {
                    @Override
                    public Message<?> preSend(
                            Message<?> message,
                            MessageChannel channel) {

                        StompHeaderAccessor accessor =
                                MessageHeaderAccessor
                                        .getAccessor(
                                                message,
                                                StompHeaderAccessor.class
                                        );

                        if (accessor != null &&
                                StompCommand.CONNECT.equals(
                                        accessor.getCommand())) {

                            String authHeader =
                                    accessor
                                            .getFirstNativeHeader(
                                                    "Authorization"
                                            );

                            if (authHeader != null &&
                                    authHeader.startsWith(
                                            "Bearer ")) {

                                String token =
                                        authHeader.substring(7);

                                try {
                                    String email =
                                            jwtUtil
                                                    .extractEmail(
                                                            token
                                                    );

                                    UsernamePasswordAuthenticationToken
                                            auth =
                                            new UsernamePasswordAuthenticationToken(
                                                    email,
                                                    null,
                                                    List.of()
                                            );

                                    // SET USER! ✅
                                    // now convertAndSendToUser
                                    // knows who to send to!
                                    accessor.setUser(auth);

                                    System.out.println(
                                            "WebSocket user set: "
                                                    + email + " ✅"
                                    );

                                } catch (Exception e) {
                                    System.out.println(
                                            "WebSocket auth error: "
                                                    + e.getMessage()
                                    );
                                }
                            }
                        }
                        return message;
                    }
                }
        );
    }
}