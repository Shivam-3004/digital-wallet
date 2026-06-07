package com.shivam.digital_wallet;

import com.shivam.digital_wallet.dto.*;
import com.shivam.digital_wallet.entity.*;
import com.shivam.digital_wallet.exception.*;
import com.shivam.digital_wallet.repository.*;
import com.shivam.digital_wallet.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Wallet Service Tests")
class WalletServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private WalletService walletService;

    private User testUser;
    private Wallet testWallet;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .role("ROLE_USER")
                .build();

        testWallet = Wallet.builder()
                .id(1L)
                .user(testUser)
                .balance(500.0)
                .build();

        // Setup security context
        Authentication authentication = mock(Authentication.class);
        lenient().when(authentication.getName()).thenReturn("test@example.com");
        SecurityContext securityContext = mock(SecurityContext.class);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Should deposit money successfully")
    void testDepositMoneySuccess() {
        DepositRequest request = new DepositRequest();
        request.setAmount(100.0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(walletRepository.findByUserForUpdate(testUser)).thenReturn(Optional.of(testWallet));

        DepositResponse response = walletService.depositMoney(request);

        assertThat(response).isNotNull();
        assertThat(response.getNewBalance()).isEqualTo(600.0);
        verify(walletRepository, times(1)).save(testWallet);
        verify(transactionRepository, times(1)).save(any());
        verify(auditLogService, times(1)).log(eq("test@example.com"), eq("DEPOSIT"), anyString());
    }

    @Test
    @DisplayName("Should throw exception for negative deposit")
    void testDepositNegativeAmount() {
        DepositRequest request = new DepositRequest();
        request.setAmount(-50.0);
        assertThatThrownBy(() -> walletService.depositMoney(request))
                .isInstanceOf(InvalidTransactionException.class)
                .hasMessageContaining("Amount must be greater than zero");
    }

    @Test
    @DisplayName("Should withdraw money successfully")
    void testWithdrawMoneySuccess() {
        WithdrawRequest request = new WithdrawRequest();
        request.setAmount(200.0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(walletRepository.findByUserForUpdate(testUser)).thenReturn(Optional.of(testWallet));

        WithdrawResponse response = walletService.withdrawMoney(request);

        assertThat(response).isNotNull();
        assertThat(response.getBalance()).isEqualTo(300.0);
        verify(walletRepository, times(1)).save(testWallet);
        verify(transactionRepository, times(1)).save(any());
        verify(auditLogService, times(1)).log(eq("test@example.com"), eq("WITHDRAW"), anyString());
    }

    @Test
    @DisplayName("Should throw exception for negative withdrawal")
    void testWithdrawNegativeAmount() {
        WithdrawRequest request = new WithdrawRequest();
        request.setAmount(-50.0);
        assertThatThrownBy(() -> walletService.withdrawMoney(request))
                .isInstanceOf(InvalidTransactionException.class);
    }

    @Test
    @DisplayName("Should throw exception for insufficient balance")
    void testWithdrawInsufficientBalance() {
        WithdrawRequest request = new WithdrawRequest();
        request.setAmount(600.0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(walletRepository.findByUserForUpdate(testUser)).thenReturn(Optional.of(testWallet));

        assertThatThrownBy(() -> walletService.withdrawMoney(request))
                .isInstanceOf(InsufficientBalanceException.class);
    }
}
