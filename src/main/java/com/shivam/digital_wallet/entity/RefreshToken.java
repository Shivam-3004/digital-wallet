package com.shivam.digital_wallet.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_token_hash", columnList = "token_hash"),
        @Index(name = "idx_expiry_date", columnList = "expiry_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @Column(nullable = false, length = 64)
    private String tokenHash;

    @Builder.Default
    private Boolean isRevoked = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private String ipAddress;

    @Column
    private String userAgent;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
