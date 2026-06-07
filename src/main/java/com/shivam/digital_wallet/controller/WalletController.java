package com.shivam.digital_wallet.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shivam.digital_wallet.dto.DepositRequest;
import com.shivam.digital_wallet.dto.DepositResponse;
import com.shivam.digital_wallet.dto.TransactionResponse;
import com.shivam.digital_wallet.dto.TransferRequest;
import com.shivam.digital_wallet.dto.TransferResponse;
import com.shivam.digital_wallet.dto.WalletBalanceResponse;
import com.shivam.digital_wallet.dto.WithdrawRequest;
import com.shivam.digital_wallet.dto.WithdrawResponse;
import com.shivam.digital_wallet.service.WalletService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/wallet")
public class WalletController {
    
    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/balance")
    public WalletBalanceResponse getBalance() {
        return walletService.getWalletBalance();
    }

    @PostMapping("/deposit")
    public DepositResponse deposit(@Valid @RequestBody DepositRequest request) {
        return walletService.depositMoney(request);
    }

    @PostMapping("/withdraw")
    public WithdrawResponse withdraw(@Valid @RequestBody WithdrawRequest request) {
        return walletService.withdrawMoney(request);
    }
    
    @GetMapping("/transactions")
    public List<TransactionResponse> getTransaction() {
        return walletService.getTransactions();
    }

    @PostMapping("/transfer")
    public TransferResponse transfer(@Valid @RequestBody TransferRequest request) {
        return walletService.transferMoney(request);
    }
}
