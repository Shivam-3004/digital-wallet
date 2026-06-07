package com.shivam.digital_wallet.repository;

import com.shivam.digital_wallet.entity.PasswordResetToken;
import com.shivam.digital_wallet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByToken(String token);
    
    Optional<PasswordResetToken> findByUserAndIsUsedFalse(User user);
    
    void deleteByUserAndExpiryDateBefore(User user, LocalDateTime date);
}
