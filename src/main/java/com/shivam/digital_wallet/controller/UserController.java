package com.shivam.digital_wallet.controller;

import com.shivam.digital_wallet.dto.ApiResponse;
import com.shivam.digital_wallet.dto.UpdateProfileRequest;
import com.shivam.digital_wallet.dto.UserProfileResponse;
import com.shivam.digital_wallet.dto.UserResponse;
import com.shivam.digital_wallet.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    
    private final UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getProfile() {
        log.info("Fetching user profile");
        UserProfileResponse profile = userService.getProfile();
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        log.info("Updating user profile");
        UserResponse userResponse = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", userResponse));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable Long id) {
        log.info("Fetching user with ID: {}", id);
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("User retrieved successfully", user));
    }

    @PostMapping("/deactivate")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse> deactivateAccount() {
        log.info("Deactivating user account");
        userService.deactivateAccount();
        return ResponseEntity.ok(ApiResponse.ok("Account deactivated successfully"));
    }

    @PostMapping("/delete")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse> deleteAccount() {
        log.info("Deleting user account");
        userService.deleteAccount();
        return ResponseEntity.ok(ApiResponse.ok("Account deleted successfully"));
    }
}
