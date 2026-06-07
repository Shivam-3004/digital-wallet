package com.shivam.digital_wallet.service;

import com.shivam.digital_wallet.entity.RefreshToken;
import com.shivam.digital_wallet.entity.User;

import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(User user, String ipAddress, String userAgent);
    Optional<RefreshToken> findByToken(String token);
    void revokeToken(RefreshToken token);
    void revokeAllUserTokens(User user);
    boolean isTokenValid(RefreshToken token);
    void deleteExpiredTokens();
}
