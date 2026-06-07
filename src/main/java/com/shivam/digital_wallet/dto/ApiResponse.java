package com.shivam.digital_wallet.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse {
    private boolean success;
    private String message;
    private Object data;
    private String timestamp;

    public static ApiResponse ok(String message, Object data) {
        return ApiResponse.builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(java.time.LocalDateTime.now().toString())
                .build();
    }

    public static ApiResponse ok(String message) {
        return ApiResponse.builder()
                .success(true)
                .message(message)
                .timestamp(java.time.LocalDateTime.now().toString())
                .build();
    }

    public static ApiResponse error(String message) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .timestamp(java.time.LocalDateTime.now().toString())
                .build();
    }
}
