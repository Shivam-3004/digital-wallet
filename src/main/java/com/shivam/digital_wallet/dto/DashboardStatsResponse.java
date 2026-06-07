package com.shivam.digital_wallet.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private Long totalUsers;
    private Long activeUsers;
    private Long blockedUsers;
    private Long totalWallets;
    private Double totalBalance;
    private Long totalTransactions;
    private Long dailyTransactions;
    private Long monthlyTransactions;
    private Double totalTransactionAmount;
}
