package com.shivam.digital_wallet.dto;

public class DepositResponse {
    private String message;
    private Double newBalance;


    public DepositResponse(String message, Double newBalance) {
        this.message = message;
        this.newBalance = newBalance;
    }


    public String getMessage() {
        return message;
    }


    public void setMessage(String message) {
        this.message = message;
    }


    
    
    public Double getNewBalance() {
        return newBalance;
    }


    public void setNewBalance(Double newBalance) {
        this.newBalance = newBalance;
    }


}
