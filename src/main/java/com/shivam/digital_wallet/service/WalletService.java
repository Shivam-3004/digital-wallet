package com.shivam.digital_wallet.service;

import com.shivam.digital_wallet.repository.TransactionRepository;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shivam.digital_wallet.dto.DepositRequest;
import com.shivam.digital_wallet.dto.DepositResponse;
import com.shivam.digital_wallet.dto.TransactionResponse;
import com.shivam.digital_wallet.dto.TransferRequest;
import com.shivam.digital_wallet.dto.TransferResponse;
import com.shivam.digital_wallet.dto.WalletBalanceResponse;
import com.shivam.digital_wallet.dto.WithdrawRequest;
import com.shivam.digital_wallet.dto.WithdrawResponse;
import com.shivam.digital_wallet.entity.Transaction;
import com.shivam.digital_wallet.entity.User;
import com.shivam.digital_wallet.entity.Wallet;
import com.shivam.digital_wallet.exception.InsufficientBalanceException;
import com.shivam.digital_wallet.exception.InvalidTransactionException;
import com.shivam.digital_wallet.exception.UserNotFoundException;
import com.shivam.digital_wallet.exception.WalletNotFoundException;
import com.shivam.digital_wallet.repository.UserRepository;
import com.shivam.digital_wallet.repository.WalletRepository;

@Service
public class WalletService {
    
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public WalletService(WalletRepository walletRepository, UserRepository userRepository, 
            TransactionRepository transactionRepository, AuditLogService auditLogService) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.auditLogService = auditLogService;
    }

    public WalletBalanceResponse getWalletBalance() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"));

        return new WalletBalanceResponse(wallet.getBalance());
    }

    @Transactional
    public DepositResponse depositMoney(DepositRequest request) {
        if (request.getAmount() <= 0) {
            throw new InvalidTransactionException("Amount must be greater than zero");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUserForUpdate(user)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"));

        wallet.setBalance(wallet.getBalance() + request.getAmount());
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setType("DEPOSIT");
        transaction.setWallet(wallet);
        transaction.setDescription("Deposited cash");
        transactionRepository.save(transaction);

        auditLogService.log(email, "DEPOSIT", "Deposited " + request.getAmount() + ". New balance: " + wallet.getBalance());

        return new DepositResponse("Money deposited successfully", wallet.getBalance());
    }

    @Transactional
    public WithdrawResponse withdrawMoney(WithdrawRequest request) {
        if (request.getAmount() <= 0) {
            throw new InvalidTransactionException("Amount must be greater than zero");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUserForUpdate(user)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"));

        if (wallet.getBalance() < request.getAmount()) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        wallet.setBalance(wallet.getBalance() - request.getAmount());
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setType("WITHDRAW");
        transaction.setWallet(wallet);
        transaction.setDescription("Withdrew cash");
        transactionRepository.save(transaction);

        auditLogService.log(email, "WITHDRAW", "Withdrew " + request.getAmount() + ". New balance: " + wallet.getBalance());

        return new WithdrawResponse("Money withdrawn successfully", wallet.getBalance());
    }

    public List<TransactionResponse> getTransactions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new WalletNotFoundException("Wallet not found"));

        return transactionRepository.findByWallet(wallet)
                .stream()
                .map(t -> new TransactionResponse(t.getAmount(), t.getType(), t.getTimestamp()))
                .toList();
    }

    @Transactional
    public TransferResponse transferMoney(TransferRequest request) {
        if (request.getAmount() <= 0) {
            throw new InvalidTransactionException("Amount must be greater than zero");
        }

        String senderEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        if (senderEmail.equals(request.getReceiverEmail())) {
            throw new InvalidTransactionException("Cannot transfer to yourself");
        }

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new UserNotFoundException("Sender not found"));

        User receiver = userRepository.findByEmail(request.getReceiverEmail())
                .orElseThrow(() -> new UserNotFoundException("Receiver not found"));

        Wallet senderWalletBasic = walletRepository.findByUser(sender)
                .orElseThrow(() -> new WalletNotFoundException("Sender wallet not found"));

        Wallet receiverWalletBasic = walletRepository.findByUser(receiver)
                .orElseThrow(() -> new WalletNotFoundException("Receiver wallet not found"));

        Wallet firstLockWallet;
        Wallet secondLockWallet;
        if (senderWalletBasic.getId() < receiverWalletBasic.getId()) {
            firstLockWallet = walletRepository.findByIdForUpdate(senderWalletBasic.getId())
                    .orElseThrow(() -> new WalletNotFoundException("Sender wallet not found"));
            secondLockWallet = walletRepository.findByIdForUpdate(receiverWalletBasic.getId())
                    .orElseThrow(() -> new WalletNotFoundException("Receiver wallet not found"));
        } else {
            secondLockWallet = walletRepository.findByIdForUpdate(receiverWalletBasic.getId())
                    .orElseThrow(() -> new WalletNotFoundException("Receiver wallet not found"));
            firstLockWallet = walletRepository.findByIdForUpdate(senderWalletBasic.getId())
                    .orElseThrow(() -> new WalletNotFoundException("Sender wallet not found"));
        }

        Wallet senderWallet = senderWalletBasic.getId().equals(firstLockWallet.getId()) ? firstLockWallet : secondLockWallet;
        Wallet receiverWallet = receiverWalletBasic.getId().equals(firstLockWallet.getId()) ? firstLockWallet : secondLockWallet;

        if (senderWallet.getBalance() < request.getAmount()) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        senderWallet.setBalance(senderWallet.getBalance() - request.getAmount());
        receiverWallet.setBalance(receiverWallet.getBalance() + request.getAmount());

        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        Transaction sentTransaction = new Transaction();
        sentTransaction.setAmount(request.getAmount());
        sentTransaction.setType("TRANSFER_SENT");
        sentTransaction.setWallet(senderWallet);
        sentTransaction.setRelatedWalletId(receiverWallet.getId());
        sentTransaction.setDescription("Sent to " + receiver.getEmail());
        transactionRepository.save(sentTransaction);

        Transaction receivedTransaction = new Transaction();
        receivedTransaction.setAmount(request.getAmount());
        receivedTransaction.setType("TRANSFER_RECEIVED");
        receivedTransaction.setWallet(receiverWallet);
        receivedTransaction.setRelatedWalletId(senderWallet.getId());
        receivedTransaction.setDescription("Received from " + sender.getEmail());
        transactionRepository.save(receivedTransaction);

        auditLogService.log(senderEmail, "TRANSFER", "Transferred " + request.getAmount() + " to " + receiver.getEmail() + ". New balance: " + senderWallet.getBalance());
        auditLogService.log(receiver.getEmail(), "TRANSFER_RECEIVED", "Received " + request.getAmount() + " from " + senderEmail + ". New balance: " + receiverWallet.getBalance());

        return new TransferResponse("Money transferred successfully", senderWallet.getBalance());
    }
}

