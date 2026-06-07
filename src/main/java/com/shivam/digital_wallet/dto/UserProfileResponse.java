package com.shivam.digital_wallet.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String profilePictureUrl;
    private Boolean isActive;
    private Boolean isBlocked;
    private String createdAt;
    private String lastLoginAt;
}
