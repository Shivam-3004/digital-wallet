package com.shivam.digital_wallet.dto;

import java.time.LocalDateTime;

public class TransactionResponse {

    private Double amount;
    private String type;
    private LocalDateTime timestamp;

    public TransactionResponse(Double amount, String type, LocalDateTime timestamp) {
        this.amount = amount;
        this.type = type;
        this.timestamp = timestamp;
    }

    public Double getAmount() {
        return amount;
    }

    public String getType() {
        return type;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}