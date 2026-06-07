package com.shivam.digital_wallet.controller;

import com.shivam.digital_wallet.dto.ApiResponse;
import com.shivam.digital_wallet.dto.TransactionHistoryResponse;
import com.shivam.digital_wallet.entity.Transaction;
import com.shivam.digital_wallet.entity.User;
import com.shivam.digital_wallet.repository.TransactionRepository;
import com.shivam.digital_wallet.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final com.shivam.digital_wallet.repository.WalletRepository walletRepository;

    @GetMapping("/history")
    public ResponseEntity<ApiResponse> getTransactionHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortBy) {
        log.info("Fetching transaction history - page: {}, size: {}", page, size);
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByEmail(email);
        
        com.shivam.digital_wallet.entity.Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new com.shivam.digital_wallet.exception.WalletNotFoundException("Wallet not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionHistoryResponse> result = transactionRepository
                .findByWalletOrderByCreatedAtDesc(wallet, pageable)
                .map(this::toTransactionResponse);

        return ResponseEntity.ok(ApiResponse.ok("Transaction history retrieved", result));
    }

    @GetMapping("/details/{transactionId}")
    public ResponseEntity<ApiResponse> getTransactionDetails(@PathVariable Long transactionId) {
        log.info("Fetching transaction details - ID: {}", transactionId);
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByEmail(email);
        
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new com.shivam.digital_wallet.exception.InvalidTransactionException("Transaction not found"));

        if (!transaction.getWallet().getUser().getId().equals(user.getId())) {
            throw new com.shivam.digital_wallet.exception.InvalidTransactionException("Unauthorized access to transaction");
        }

        return ResponseEntity.ok(ApiResponse.ok("Transaction details retrieved", toTransactionResponse(transaction)));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse> getRecentTransactions(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("Fetching recent transactions - limit: {}", limit);
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByEmail(email);
        
        com.shivam.digital_wallet.entity.Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new com.shivam.digital_wallet.exception.WalletNotFoundException("Wallet not found"));

        Pageable pageable = PageRequest.of(0, limit);
        List<TransactionHistoryResponse> recentTransactions = transactionRepository
                .findByWalletOrderByCreatedAtDesc(wallet, pageable)
                .getContent()
                .stream()
                .map(this::toTransactionResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Recent transactions retrieved", recentTransactions));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse> filterTransactions(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Filtering transactions - type: {}, status: {}, date range: {} to {}", 
                type, status, startDate, endDate);
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByEmail(email);
        
        com.shivam.digital_wallet.entity.Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new com.shivam.digital_wallet.exception.WalletNotFoundException("Wallet not found"));

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionHistoryResponse> result = transactionRepository.filterTransactions(
                wallet, type, status, minAmount, maxAmount, startDateTime, endDateTime, pageable)
                .map(this::toTransactionResponse);

        return ResponseEntity.ok(ApiResponse.ok("Filtered transactions retrieved", result));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchTransactions(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Searching transactions - query: {}", query);
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByEmail(email);
        
        com.shivam.digital_wallet.entity.Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new com.shivam.digital_wallet.exception.WalletNotFoundException("Wallet not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionHistoryResponse> result = transactionRepository.searchTransactions(
                wallet, query, pageable)
                .map(this::toTransactionResponse);
        
        return ResponseEntity.ok(ApiResponse.ok("Search results retrieved", result));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse> getTransactionSummary() {
        log.info("Fetching transaction summary");
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.findByEmail(email);
        
        com.shivam.digital_wallet.entity.Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new com.shivam.digital_wallet.exception.WalletNotFoundException("Wallet not found"));

        long totalCount = transactionRepository.countByWallet(wallet);
        Double totalAmount = transactionRepository.sumAmountByWallet(wallet);
        long depositCount = transactionRepository.countByWalletAndTypeIgnoreCase(wallet, "DEPOSIT");
        long withdrawCount = transactionRepository.countByWalletAndTypeIgnoreCase(wallet, "WITHDRAW");

        String summary = String.format(
                "Total Transactions: %d, Total Amount: %.2f, Deposits: %d, Withdrawals: %d",
                totalCount, totalAmount, depositCount, withdrawCount
        );

        return ResponseEntity.ok(ApiResponse.ok(summary, null));
    }

    private TransactionHistoryResponse toTransactionResponse(Transaction transaction) {
        return TransactionHistoryResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .status(transaction.getStatus())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt().toString())
                .walletId(transaction.getWallet().getId().toString())
                .relatedWalletId(transaction.getRelatedWalletId() != null ? 
                        transaction.getRelatedWalletId().toString() : null)
                .build();
    }
}
