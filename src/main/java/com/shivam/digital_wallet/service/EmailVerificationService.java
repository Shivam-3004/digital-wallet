package com.shivam.digital_wallet.service;

import com.shivam.digital_wallet.entity.EmailVerificationToken;
import com.shivam.digital_wallet.entity.User;

import java.util.Optional;

public interface EmailVerificationService {
    EmailVerificationToken createVerificationToken(User user);
    Optional<EmailVerificationToken> findByToken(String token);
    boolean isTokenValid(EmailVerificationToken token);
    void markTokenAsUsed(EmailVerificationToken token);
    void deleteExpiredTokens();
}
