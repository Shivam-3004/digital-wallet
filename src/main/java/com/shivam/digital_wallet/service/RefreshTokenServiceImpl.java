package com.shivam.digital_wallet.service;

import com.shivam.digital_wallet.entity.RefreshToken;
import com.shivam.digital_wallet.entity.User;
import com.shivam.digital_wallet.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RefreshTokenServiceImpl implements RefreshTokenService {
    
    private final RefreshTokenRepository refreshTokenRepository;
    
    @Value("${jwt.refresh.expiration:7}")
    private long refreshTokenExpirationDays;
    
    private static final int MAX_REFRESH_TOKENS_PER_USER = 5;
    private static final int TOKEN_LENGTH = 32;

    @Override
    public RefreshToken createRefreshToken(User user, String ipAddress, String userAgent) {
        log.debug("Creating refresh token for user: {}", user.getEmail());
        
        List<RefreshToken> activeTokens = refreshTokenRepository.findActiveTokensByUser(user);
        if (activeTokens.size() >= MAX_REFRESH_TOKENS_PER_USER) {
            RefreshToken oldestToken = activeTokens.get(activeTokens.size() - 1);
            oldestToken.setIsRevoked(true);
            refreshTokenRepository.save(oldestToken);
            log.debug("Revoked oldest refresh token for user: {}", user.getEmail());
        }

        String tokenValue = generateToken();
        String tokenHash = hashToken(tokenValue);
        LocalDateTime expiryDate = LocalDateTime.now().plusDays(refreshTokenExpirationDays);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(tokenValue)
                .tokenHash(tokenHash)
                .isRevoked(false)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .expiryDate(expiryDate)
                .build();

        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.info("Refresh token created for user: {}", user.getEmail());
        return saved;
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        String tokenHash = hashToken(token);
        return refreshTokenRepository.findByTokenHash(tokenHash);
    }

    @Override
    public void revokeToken(RefreshToken token) {
        token.setIsRevoked(true);
        token.setUpdatedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);
        log.info("Refresh token revoked for user: {}", token.getUser().getEmail());
    }

    @Override
    public void revokeAllUserTokens(User user) {
        List<RefreshToken> userTokens = refreshTokenRepository.findByUserAndIsRevokedFalse(user);
        userTokens.forEach(token -> {
            token.setIsRevoked(true);
            token.setUpdatedAt(LocalDateTime.now());
        });
        refreshTokenRepository.saveAll(userTokens);
        log.info("All refresh tokens revoked for user: {}", user.getEmail());
    }

    @Override
    public boolean isTokenValid(RefreshToken token) {
        return !token.getIsRevoked() && LocalDateTime.now().isBefore(token.getExpiryDate());
    }

    @Override
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Expired refresh tokens cleaned up");
    }

    private String generateToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[TOKEN_LENGTH];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            log.error("Error hashing token", e);
            throw new RuntimeException("Token hashing failed", e);
        }
    }
}
