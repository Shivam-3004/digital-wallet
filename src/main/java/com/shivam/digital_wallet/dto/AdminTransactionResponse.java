package com.shivam.digital_wallet.dto;

import java.time.LocalDateTime;

public class AdminTransactionResponse {

    private Long transactionId;
    private String userEmail;
    private String transactionType;
    private Double amount;
    private LocalDateTime timestamp;

    public AdminTransactionResponse(
            Long transactionId,
            String userEmail,
            String transactionType,
            Double amount,
            LocalDateTime timestamp) {

        this.transactionId = transactionId;
        this.userEmail = userEmail;
        this.transactionType = transactionType;
        this.amount = amount;
        this.timestamp = timestamp;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public Double getAmount() {
        return amount;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}