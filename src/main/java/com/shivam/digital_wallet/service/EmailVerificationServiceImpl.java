package com.shivam.digital_wallet.service;

import com.shivam.digital_wallet.entity.EmailVerificationToken;
import com.shivam.digital_wallet.entity.User;
import com.shivam.digital_wallet.repository.EmailVerificationTokenRepository;
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
public class EmailVerificationServiceImpl implements EmailVerificationService {
    
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    
    @Value("${email.verification.expiration.hours:24}")
    private long verificationTokenExpirationHours;

    @Override
    public EmailVerificationToken createVerificationToken(User user) {
        log.debug("Creating email verification token for user: {}", user.getEmail());
        
        emailVerificationTokenRepository.findByUser(user).ifPresent(token -> {
            emailVerificationTokenRepository.delete(token);
            log.debug("Removed existing verification token for user: {}", user.getEmail());
        });

        String tokenValue = generateToken();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(verificationTokenExpirationHours);

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(tokenValue)
                .isUsed(false)
                .expiryDate(expiryDate)
                .build();

        EmailVerificationToken saved = emailVerificationTokenRepository.save(verificationToken);
        log.info("Email verification token created for user: {}", user.getEmail());
        return saved;
    }

    @Override
    public Optional<EmailVerificationToken> findByToken(String token) {
        return emailVerificationTokenRepository.findByToken(token);
    }

    @Override
    public boolean isTokenValid(EmailVerificationToken token) {
        return !token.getIsUsed() && LocalDateTime.now().isBefore(token.getExpiryDate());
    }

    @Override
    public void markTokenAsUsed(EmailVerificationToken token) {
        token.setIsUsed(true);
        token.setUsedAt(LocalDateTime.now());
        emailVerificationTokenRepository.save(token);
        log.info("Email verification token marked as used for user: {}", token.getUser().getEmail());
    }

    @Override
    public void deleteExpiredTokens() {
        emailVerificationTokenRepository.deleteAll(
            emailVerificationTokenRepository.findAll().stream()
                .filter(token -> LocalDateTime.now().isAfter(token.getExpiryDate()))
                .toList()
        );
        log.info("Expired email verification tokens cleaned up");
    }

    private String generateToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
