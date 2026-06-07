package com.shivam.digital_wallet.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shivam.digital_wallet.entity.Transaction;
import com.shivam.digital_wallet.entity.Wallet;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWallet(Wallet wallet);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t")
    Double sumAmount();

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Transaction t WHERE t.wallet = :wallet ORDER BY t.createdAt DESC")
    org.springframework.data.domain.Page<Transaction> findByWalletOrderByCreatedAtDesc(
            @org.springframework.data.repository.query.Param("wallet") Wallet wallet,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Transaction t WHERE t.wallet = :wallet " +
           "AND (cast(:type as string) IS NULL OR LOWER(t.type) = LOWER(cast(:type as string))) " +
           "AND (cast(:status as string) IS NULL OR LOWER(t.status) = LOWER(cast(:status as string))) " +
           "AND (cast(:minAmount as double) IS NULL OR t.amount >= :minAmount) " +
           "AND (cast(:maxAmount as double) IS NULL OR t.amount <= :maxAmount) " +
           "AND (cast(:startDate as timestamp) IS NULL OR t.createdAt >= :startDate) " +
           "AND (cast(:endDate as timestamp) IS NULL OR t.createdAt <= :endDate) " +
           "ORDER BY t.createdAt DESC")
    org.springframework.data.domain.Page<Transaction> filterTransactions(
            @org.springframework.data.repository.query.Param("wallet") Wallet wallet,
            @org.springframework.data.repository.query.Param("type") String type,
            @org.springframework.data.repository.query.Param("status") String status,
            @org.springframework.data.repository.query.Param("minAmount") Double minAmount,
            @org.springframework.data.repository.query.Param("maxAmount") Double maxAmount,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Transaction t WHERE t.wallet = :wallet AND t.description IS NOT NULL AND LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY t.createdAt DESC")
    org.springframework.data.domain.Page<Transaction> searchTransactions(
            @org.springframework.data.repository.query.Param("wallet") Wallet wallet,
            @org.springframework.data.repository.query.Param("query") String query,
            org.springframework.data.domain.Pageable pageable);

    long countByWallet(Wallet wallet);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t WHERE t.wallet = :wallet")
    Double sumAmountByWallet(@org.springframework.data.repository.query.Param("wallet") Wallet wallet);

    long countByWalletAndTypeIgnoreCase(Wallet wallet, String type);
}
