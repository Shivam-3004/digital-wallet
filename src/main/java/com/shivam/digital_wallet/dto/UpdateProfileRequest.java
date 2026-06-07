package com.shivam.digital_wallet.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String profilePictureUrl;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String country;
}
