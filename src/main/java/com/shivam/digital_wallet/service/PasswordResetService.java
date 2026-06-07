package com.shivam.digital_wallet.service;

import com.shivam.digital_wallet.entity.PasswordResetToken;
import com.shivam.digital_wallet.entity.User;

import java.util.Optional;

public interface PasswordResetService {
    PasswordResetToken createResetToken(User user);
    Optional<PasswordResetToken> findByToken(String token);
    boolean isTokenValid(PasswordResetToken token);
    void markTokenAsUsed(PasswordResetToken token);
    void deleteExpiredTokens();
}
