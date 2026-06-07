package com.shivam.digital_wallet.security;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BruteForceProtectionService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCK_TIME_MINUTES = 15;

    private final Map<String, LoginAttempts> attemptsMap = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attemptsMap.remove(key);
    }

    public void loginFailed(String key) {
        attemptsMap.compute(key, (k, val) -> {
            if (val == null) {
                return new LoginAttempts(1, LocalDateTime.now());
            } else {
                return new LoginAttempts(val.attempts + 1, LocalDateTime.now());
            }
        });
    }

    public boolean isBlocked(String key) {
        LoginAttempts val = attemptsMap.get(key);
        if (val == null) {
            return false;
        }
        if (val.attempts >= MAX_ATTEMPTS) {
            if (LocalDateTime.now().isBefore(val.lastAttempt.plusMinutes(LOCK_TIME_MINUTES))) {
                return true;
            } else {
                attemptsMap.remove(key);
                return false;
            }
        }
        return false;
    }

    private static class LoginAttempts {
        final int attempts;
        final LocalDateTime lastAttempt;

        LoginAttempts(int attempts, LocalDateTime lastAttempt) {
            this.attempts = attempts;
            this.lastAttempt = lastAttempt;
        }
    }
}
