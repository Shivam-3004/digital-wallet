package com.shivam.digital_wallet.dto;

public class WalletBalanceResponse {
    private Double balance;

    public WalletBalanceResponse(Double balance) {
        this.balance = balance;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }
}
