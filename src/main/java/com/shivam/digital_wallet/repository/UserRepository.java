package com.shivam.digital_wallet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import com.shivam.digital_wallet.entity.User;

@Repository
public interface  UserRepository extends  JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    long countByIsActiveTrue();
    long countByIsBlockedTrue();
}
