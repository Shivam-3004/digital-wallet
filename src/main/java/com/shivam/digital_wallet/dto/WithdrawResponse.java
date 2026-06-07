package com.shivam.digital_wallet.dto;

public class WithdrawResponse {
    private String message;
    private Double balance;

    public WithdrawResponse(String message, Double balance) {
        this.message = message;
        this.balance = balance;
    }

    public String getMessage() {
        return message;
    }


    public void setMessage(String message) {
        this.message = message;
    }



    
    public Double getBalance() {
        return balance;
    }


    public void setBalance(Double balance) {
        this.balance = balance;
    }




}
