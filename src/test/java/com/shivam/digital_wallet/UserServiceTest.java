package com.shivam.digital_wallet;

import com.shivam.digital_wallet.dto.*;
import com.shivam.digital_wallet.entity.*;
import com.shivam.digital_wallet.exception.*;
import com.shivam.digital_wallet.repository.*;
import com.shivam.digital_wallet.service.*;
import com.shivam.digital_wallet.security.BruteForceProtectionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Service Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private EmailVerificationService emailVerificationService;

    @Mock
    private PasswordResetService passwordResetService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private BruteForceProtectionService bruteForceProtectionService;

    @Mock
    private Environment env;

    @InjectMocks
    private UserService userService;

    private RegisterRequest registerRequest;
    private User testUser;
    private EmailVerificationToken verificationToken;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setName("John Doe");
        registerRequest.setPassword("SecretPass1!");

        testUser = User.builder()
                .id(1L)
                .name("John Doe")
                .email("test@example.com")
                .password("encodedPassword")
                .role("ROLE_USER")
                .isActive(true)
                .isBlocked(false)
                .build();

        verificationToken = EmailVerificationToken.builder()
                .token("verify-token")
                .user(testUser)
                .build();
    }

    @Test
    @DisplayName("Should register user successfully")
    void testRegisterUserSuccess() {
        when(userRepository.findByEmail(registerRequest.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any())).thenReturn(testUser);
        when(emailVerificationService.createVerificationToken(any())).thenReturn(verificationToken);
        when(env.getActiveProfiles()).thenReturn(new String[]{"dev"});

        UserResponse response = userService.registerUser(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo(registerRequest.getEmail());
        assertThat(response.getDebugToken()).isEqualTo("verify-token");
        verify(userRepository, times(1)).save(any());
        verify(walletRepository, times(1)).save(any());
        verify(auditLogService, times(1)).log(eq(testUser.getEmail()), eq("REGISTER"), anyString());
    }

    @Test
    @DisplayName("Should throw exception when email exists")
    void testRegisterUserEmailExists() {
        when(userRepository.findByEmail(registerRequest.getEmail())).thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> userService.registerUser(registerRequest))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    @DisplayName("Should throw exception when password is weak")
    void testRegisterUserWeakPassword() {
        registerRequest.setPassword("123");
        assertThatThrownBy(() -> userService.registerUser(registerRequest))
                .isInstanceOf(InvalidTokenException.class);
    }
}
