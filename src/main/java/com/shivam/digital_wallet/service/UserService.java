package com.shivam.digital_wallet.service;

import com.shivam.digital_wallet.repository.*;
import com.shivam.digital_wallet.entity.*;
import com.shivam.digital_wallet.exception.*;
import com.shivam.digital_wallet.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;
    private final AuditLogService auditLogService;
    private final com.shivam.digital_wallet.security.BruteForceProtectionService bruteForceProtectionService;
    private final org.springframework.core.env.Environment env;

    private static final String PASSWORD_PATTERN = 
        "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
    private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);

    @Transactional
    public UserResponse registerUser(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());
        
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Registration failed - email already exists: {}", request.getEmail());
            throw new DuplicateEmailException("Email already registered");
        }

        validatePasswordStrength(request.getPassword());

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .isActive(true)
                .isBlocked(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        Wallet wallet = Wallet.builder()
                .user(savedUser)
                .balance(0.0)
                .build();
        walletRepository.save(wallet);

        var verificationToken = emailVerificationService.createVerificationToken(savedUser);
        log.info("Email verification link: http://localhost:5173/verify-email?token={}", verificationToken.getToken());
        auditLogService.log(savedUser.getEmail(), "REGISTER", "Registered new user account");

        UserResponse response = new UserResponse(savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole());
        
        boolean isDebug = java.util.Arrays.asList(env.getActiveProfiles()).contains("dev") 
                        || java.util.Arrays.asList(env.getActiveProfiles()).contains("test");
        if (isDebug) {
            response.setDebugToken(verificationToken.getToken());
        }

        return response;
    }

    @Transactional
    public User loginUser(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getEmail());
        
        String ipAddress = "UNKNOWN";
        org.springframework.web.context.request.ServletRequestAttributes attributes = 
                (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            ipAddress = attributes.getRequest().getRemoteAddr();
        }

        if (bruteForceProtectionService.isBlocked(request.getEmail()) || bruteForceProtectionService.isBlocked(ipAddress)) {
            log.warn("Login blocked - too many failed attempts: {}", request.getEmail());
            throw new UserNotFoundException("Account temporarily locked due to multiple login failures. Please try again in 15 minutes.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    bruteForceProtectionService.loginFailed(request.getEmail());
                    return new UserNotFoundException("User not found");
                });

        if (user.getIsBlocked()) {
            log.warn("Login blocked - user account is blocked: {}", request.getEmail());
            throw new UserNotFoundException("User account is blocked");
        }

        if (!user.getIsActive()) {
            log.warn("Login failed - user account is inactive: {}", request.getEmail());
            throw new UserNotFoundException("User account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            bruteForceProtectionService.loginFailed(request.getEmail());
            if (attributes != null) {
                bruteForceProtectionService.loginFailed(ipAddress);
            }
            log.warn("Login failed - invalid password for user: {}", request.getEmail());
            throw new UserNotFoundException("Invalid credentials");
        }

        bruteForceProtectionService.loginSucceeded(request.getEmail());
        if (attributes != null) {
            bruteForceProtectionService.loginSucceeded(ipAddress);
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        auditLogService.log(user.getEmail(), "LOGIN", "Login successful");
        log.info("User logged in successfully: {}", request.getEmail());

        return user;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public UserProfileResponse getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = findByEmail(email);
        
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt().toString())
                .lastLoginAt(user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null)
                .build();
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = findByEmail(email);

        if (request.getFirstName() != null) user.setName(request.getFirstName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getProfilePictureUrl() != null) user.setProfilePictureUrl(request.getProfilePictureUrl());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getZipCode() != null) user.setZipCode(request.getZipCode());
        if (request.getCountry() != null) user.setCountry(request.getCountry());

        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);
        
        auditLogService.log(email, "UPDATE_PROFILE", "Updated profile info");
        log.info("Profile updated for user: {}", email);

        return new UserResponse(updated.getId(), updated.getName(), updated.getEmail(), updated.getRole());
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        log.info("Change password request for user: {}", email);
        
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidTokenException("Passwords do not match");
        }

        validatePasswordStrength(request.getNewPassword());

        User user = findByEmail(email);
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            log.warn("Change password failed - current password incorrect for user: {}", email);
            throw new InvalidTokenException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        refreshTokenService.revokeAllUserTokens(user);
        
        auditLogService.log(email, "CHANGE_PASSWORD", "Changed password successfully");
        log.info("Password changed successfully for user: {}", email);
    }

    @Transactional
    public String initiatePasswordReset(String email) {
        log.info("Password reset initiated for email: {}", email);
        User user = findByEmail(email);
        var resetToken = passwordResetService.createResetToken(user);
        
        log.info("Password reset link: http://localhost:5173/reset-password?token={}", resetToken.getToken());
        auditLogService.log(email, "PASSWORD_RESET_REQUEST", "Password reset requested");
        
        return resetToken.getToken();
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Reset password request with token");
        
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidTokenException("Passwords do not match");
        }

        validatePasswordStrength(request.getNewPassword());

        PasswordResetToken resetToken = passwordResetService.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid reset token"));

        if (!passwordResetService.isTokenValid(resetToken)) {
            throw new InvalidTokenException("Reset token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        passwordResetService.markTokenAsUsed(resetToken);
        refreshTokenService.revokeAllUserTokens(user);
        
        auditLogService.log(user.getEmail(), "PASSWORD_RESET", "Password reset completed successfully");
        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    @Transactional
    public void verifyEmail(String token) {
        log.info("Email verification with token");
        
        EmailVerificationToken verificationToken = emailVerificationService.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid verification token"));

        if (!emailVerificationService.isTokenValid(verificationToken)) {
            throw new InvalidTokenException("Verification token expired");
        }

        User user = verificationToken.getUser();
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        emailVerificationService.markTokenAsUsed(verificationToken);
        
        auditLogService.log(user.getEmail(), "EMAIL_VERIFY", "Email verification completed successfully");
        log.info("Email verified successfully for user: {}", user.getEmail());
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        log.info("Resend verification email for user: {}", email);
        User user = findByEmail(email);
        var verificationToken = emailVerificationService.createVerificationToken(user);
        
        log.info("Email verification link (resend): http://localhost:5173/verify-email?token={}", verificationToken.getToken());
        auditLogService.log(email, "RESEND_VERIFICATION", "Verification email resent");
    }

    @Transactional
    public void deleteAccount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = findByEmail(email);
        
        walletRepository.deleteByUser(user);
        refreshTokenService.revokeAllUserTokens(user);
        userRepository.delete(user);
        
        auditLogService.log(email, "DELETE_ACCOUNT", "Account deleted");
        log.info("User account deleted: {}", email);
    }

    @Transactional
    public void deactivateAccount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = findByEmail(email);
        
        user.setIsActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        refreshTokenService.revokeAllUserTokens(user);
        
        auditLogService.log(email, "DEACTIVATE_ACCOUNT", "Account deactivated");
        log.info("User account deactivated: {}", email);
    }

    @Transactional
    public void blockUser(Long userId) {
        log.info("Blocking user with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        user.setIsBlocked(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        refreshTokenService.revokeAllUserTokens(user);
        
        auditLogService.log(user.getEmail(), "BLOCK_USER", "Blocked by Admin");
        log.info("User blocked: {}", user.getEmail());
    }

    @Transactional
    public void unblockUser(Long userId) {
        log.info("Unblocking user with ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        user.setIsBlocked(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        auditLogService.log(user.getEmail(), "UNBLOCK_USER", "Unblocked by Admin");
        log.info("User unblocked: {}", user.getEmail());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<WalletResponse> getAllWallets() {
        return walletRepository.findAll().stream()
                .map(wallet -> new WalletResponse(wallet.getUser().getId(),
                        wallet.getUser().getName(),
                        wallet.getUser().getEmail(),
                        wallet.getBalance()))
                .toList();
    }

    public List<AdminTransactionResponse> getAllTransactions() {
        return transactionRepository.findAll()
                .stream()
                .map(transaction -> new AdminTransactionResponse(
                        transaction.getId(),
                        transaction.getWallet().getUser().getEmail(),
                        transaction.getType(),
                        transaction.getAmount(),
                        transaction.getTimestamp()))
                .toList();
    }

    public AdminDashboardResponse getDashboardStats() {
        Long totalUsers = userRepository.count();
        Long activeUsers = userRepository.countByIsActiveTrue();
        Long blockedUsers = userRepository.countByIsBlockedTrue();
        
        Long totalWallets = walletRepository.count();
        Double totalBalance = walletRepository.sumBalance();
        
        Long totalTransactions = transactionRepository.count();
        Double totalTransactionAmount = transactionRepository.sumAmount();

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .blockedUsers(blockedUsers)
                .totalWallets(totalWallets)
                .totalBalance(totalBalance)
                .totalTransactions(totalTransactions)
                .totalTransactionAmount(totalTransactionAmount)
                .dailyTransactions(0L)
                .monthlyTransactions(0L)
                .build();
    }

    private void validatePasswordStrength(String password) {
        if (!pattern.matcher(password).matches()) {
            throw new InvalidTokenException(
                "Password must be at least 8 characters and contain uppercase, lowercase, number and special character"
            );
        }
    }
}
