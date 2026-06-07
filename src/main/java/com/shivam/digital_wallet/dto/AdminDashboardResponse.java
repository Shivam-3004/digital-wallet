package com.shivam.digital_wallet.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {
    private Long totalUsers;
    private Long activeUsers;
    private Long blockedUsers;
    private Long totalWallets;
    private Double totalBalance;
    private Long totalTransactions;
    private Double totalTransactionAmount;
    private Long dailyTransactions;
    private Long monthlyTransactions;
}