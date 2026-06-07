package com.shivam.digital_wallet.repository;

import com.shivam.digital_wallet.entity.EmailVerificationToken;
import com.shivam.digital_wallet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    
    Optional<EmailVerificationToken> findByToken(String token);
    
    Optional<EmailVerificationToken> findByUser(User user);
    
    void deleteByUserAndExpiryDateBefore(User user, LocalDateTime date);
}
