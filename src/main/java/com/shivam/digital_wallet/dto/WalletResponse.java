package com.shivam.digital_wallet.dto;

public class WalletResponse {
    
    private Long userId;
    private String userName;
    private String email;
    private Double balance;

    public WalletResponse(Long userId, String userName, String email, Double balance) {
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.balance = balance;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getEmail() {
        return email;
    }

    public Double getBalance() {
        return balance;
    }
}
