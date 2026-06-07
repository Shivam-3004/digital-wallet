package com.shivam.digital_wallet.repository;

import com.shivam.digital_wallet.entity.RefreshToken;
import com.shivam.digital_wallet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
    Optional<RefreshToken> findByToken(String token);
    
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    
    List<RefreshToken> findByUser(User user);
    
    List<RefreshToken> findByUserAndIsRevokedFalse(User user);
    
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = ?1 AND rt.isRevoked = false ORDER BY rt.createdAt DESC")
    List<RefreshToken> findActiveTokensByUser(User user);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < ?1")
    void deleteExpiredTokens(LocalDateTime now);
    
    void deleteByUser(User user);
    
    long countByUserAndIsRevokedFalse(User user);
}
