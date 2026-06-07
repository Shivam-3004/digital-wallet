package com.shivam.digital_wallet.controller;

import com.shivam.digital_wallet.dto.*;
import com.shivam.digital_wallet.entity.User;
import com.shivam.digital_wallet.service.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final UserService userService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;
    private final org.springframework.core.env.Environment env;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("User registration attempt for email: {}", request.getEmail());
        UserResponse userResponse = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully", userResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        log.info("User login attempt for email: {}", request.getEmail());
        userService.loginUser(request);
        User user = userService.findByEmail(request.getEmail());
        
        String accessToken = jwtService.generateToken(request.getEmail());
        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");
        
        var refreshToken = refreshTokenService.createRefreshToken(user, ipAddress, userAgent);
        
        var response = RefreshTokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .build();
        
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Refresh token request");
        var refreshToken = refreshTokenService.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new com.shivam.digital_wallet.exception.InvalidTokenException("Invalid refresh token"));
        
        if (!refreshTokenService.isTokenValid(refreshToken)) {
            throw new com.shivam.digital_wallet.exception.InvalidTokenException("Refresh token expired");
        }
        
        User user = refreshToken.getUser();
        String newAccessToken = jwtService.generateToken(user.getEmail());
        
        var response = RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .build();
        
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            User user = userService.findByEmail(email);
            refreshTokenService.revokeAllUserTokens(user);
            log.info("User logged out: {}", email);
            return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Logout successful"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        log.info("Change password request for user: {}", email);
        userService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password request for email: {}", request.getEmail());
        String token = userService.initiatePasswordReset(request.getEmail());
        
        boolean isDebug = java.util.Arrays.asList(env.getActiveProfiles()).contains("dev") 
                       || java.util.Arrays.asList(env.getActiveProfiles()).contains("test");
        if (isDebug) {
            return ResponseEntity.ok(ApiResponse.ok("Password reset link sent to email (Debug Mode)", token));
        }
        return ResponseEntity.ok(ApiResponse.ok("Password reset link sent to email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Reset password request");
        userService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        log.info("Email verification request");
        userService.verifyEmail(request.getToken());
        return ResponseEntity.ok(ApiResponse.ok("Email verified successfully"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse> resendVerification() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        log.info("Resend verification request for user: {}", email);
        userService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.ok("Verification email sent"));
    }
}
