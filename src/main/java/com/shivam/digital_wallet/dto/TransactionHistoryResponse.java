package com.shivam.digital_wallet.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionHistoryResponse {
    private Long id;
    private String type;
    private String status;
    private Double amount;
    private String description;
    private String createdAt;
    private String walletId;
    private String relatedWalletId;
}
