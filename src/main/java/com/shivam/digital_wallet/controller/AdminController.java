package com.shivam.digital_wallet.controller;

import com.shivam.digital_wallet.dto.ApiResponse;
import com.shivam.digital_wallet.dto.AdminDashboardResponse;
import com.shivam.digital_wallet.dto.AdminTransactionResponse;
import com.shivam.digital_wallet.dto.UserResponse;
import com.shivam.digital_wallet.entity.User;
import com.shivam.digital_wallet.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final UserService userService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse> getDashboardStats() {
        log.info("Fetching admin dashboard statistics");
        AdminDashboardResponse stats = userService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok("Dashboard stats retrieved", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Fetching all users - page: {}, size: {}", page, size);
        List<User> users = userService.getAllUsers();
        Pageable pageable = PageRequest.of(page, size);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + size, users.size());
        List<User> pageContent = users.subList(start, end);
        Page<User> userPage = new PageImpl<>(pageContent, pageable, users.size());
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", userPage));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse> getUserDetails(@PathVariable Long id) {
        log.info("Fetching user details for ID: {}", id);
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("User details retrieved", user));
    }

    @PostMapping("/users/{id}/block")
    public ResponseEntity<ApiResponse> blockUser(@PathVariable Long id) {
        log.warn("Admin blocking user with ID: {}", id);
        userService.blockUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User blocked successfully"));
    }

    @PostMapping("/users/{id}/unblock")
    public ResponseEntity<ApiResponse> unblockUser(@PathVariable Long id) {
        log.info("Admin unblocking user with ID: {}", id);
        userService.unblockUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User unblocked successfully"));
    }

    @GetMapping("/wallets")
    public ResponseEntity<ApiResponse> getAllWallets() {
        log.info("Fetching all wallets");
        return ResponseEntity.ok(ApiResponse.ok("Wallets retrieved", userService.getAllWallets()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Fetching all transactions - page: {}, size: {}", page, size);
        List<AdminTransactionResponse> transactions = userService.getAllTransactions();
        Pageable pageable = PageRequest.of(page, size);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + size, transactions.size());
        List<AdminTransactionResponse> pageContent = transactions.subList(start, end);
        return ResponseEntity.ok(ApiResponse.ok("Transactions retrieved", pageContent));
    }
}
