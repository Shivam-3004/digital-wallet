package com.shivam.digital_wallet;

import com.shivam.digital_wallet.entity.RefreshToken;
import com.shivam.digital_wallet.entity.User;
import com.shivam.digital_wallet.repository.RefreshTokenRepository;
import com.shivam.digital_wallet.service.RefreshTokenServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Refresh Token Service Tests")
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenServiceImpl refreshTokenService;

    private User testUser;
    private RefreshToken testToken;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("john@example.com")
                .password("hashedPassword")
                .role("ROLE_USER")
                .isActive(true)
                .isBlocked(false)
                .build();

        testToken = RefreshToken.builder()
                .id(1L)
                .user(testUser)
                .token("test-token-value")
                .isRevoked(false)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .ipAddress("127.0.0.1")
                .build();
    }

    @Test
    @DisplayName("Should create refresh token successfully")
    void testCreateRefreshTokenSuccess() {
        when(refreshTokenRepository.findActiveTokensByUser(testUser)).thenReturn(java.util.List.of());
        when(refreshTokenRepository.save(any())).thenReturn(testToken);

        RefreshToken token = refreshTokenService.createRefreshToken(testUser, "127.0.0.1", "Test-Agent");

        assertThat(token).isNotNull();
        assertThat(token.getUser().getId()).isEqualTo(testUser.getId());
        assertThat(token.getIsRevoked()).isFalse();
        verify(refreshTokenRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should revoke refresh token successfully")
    void testRevokeTokenSuccess() {
        refreshTokenService.revokeToken(testToken);

        assertThat(testToken.getIsRevoked()).isTrue();
        verify(refreshTokenRepository, times(1)).save(testToken);
    }

    @Test
    @DisplayName("Should validate token correctly when valid")
    void testIsTokenValidWhenValid() {
        testToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        testToken.setIsRevoked(false);

        boolean isValid = refreshTokenService.isTokenValid(testToken);

        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should return false when token is revoked")
    void testIsTokenValidWhenRevoked() {
        testToken.setIsRevoked(true);

        boolean isValid = refreshTokenService.isTokenValid(testToken);

        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should return false when token is expired")
    void testIsTokenValidWhenExpired() {
        testToken.setExpiryDate(LocalDateTime.now().minusHours(1));
        testToken.setIsRevoked(false);

        boolean isValid = refreshTokenService.isTokenValid(testToken);

        assertThat(isValid).isFalse();
    }
}
