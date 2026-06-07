package com.shivam.digital_wallet.service;

import com.shivam.digital_wallet.entity.PasswordResetToken;
import com.shivam.digital_wallet.entity.User;
import com.shivam.digital_wallet.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService {
    
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Value("${password.reset.expiration.hours:1}")
    private long resetTokenExpirationHours;

    @Override
    public PasswordResetToken createResetToken(User user) {
        log.debug("Creating password reset token for user: {}", user.getEmail());
        
        passwordResetTokenRepository.findByUserAndIsUsedFalse(user).ifPresent(token -> {
            passwordResetTokenRepository.delete(token);
            log.debug("Removed existing reset token for user: {}", user.getEmail());
        });

        String tokenValue = generateToken();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(resetTokenExpirationHours);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(tokenValue)
                .isUsed(false)
                .expiryDate(expiryDate)
                .build();

        PasswordResetToken saved = passwordResetTokenRepository.save(resetToken);
        log.info("Password reset token created for user: {}", user.getEmail());
        return saved;
    }

    @Override
    public Optional<PasswordResetToken> findByToken(String token) {
        return passwordResetTokenRepository.findByToken(token);
    }

    @Override
    public boolean isTokenValid(PasswordResetToken token) {
        return !token.getIsUsed() && LocalDateTime.now().isBefore(token.getExpiryDate());
    }

    @Override
    public void markTokenAsUsed(PasswordResetToken token) {
        token.setIsUsed(true);
        token.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(token);
        log.info("Password reset token marked as used for user: {}", token.getUser().getEmail());
    }

    @Override
    public void deleteExpiredTokens() {
        passwordResetTokenRepository.deleteAll(
            passwordResetTokenRepository.findAll().stream()
                .filter(token -> LocalDateTime.now().isAfter(token.getExpiryDate()))
                .toList()
        );
        log.info("Expired password reset tokens cleaned up");
    }

    private String generateToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
