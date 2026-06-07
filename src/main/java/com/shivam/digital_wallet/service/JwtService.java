package com.shivam.digital_wallet.service;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;

@Service
public class JwtService {
    
    private static final long JWT_EXPIRATION_HOURS = 24;
    private static final long JWT_EXPIRATION_MILLISECONDS = JWT_EXPIRATION_HOURS * 60 * 60 * 1000;
    
    @Value("${jwt.secret}")
    private String secretKey;

    @jakarta.annotation.PostConstruct
    public void init() {
        if (secretKey == null || secretKey.getBytes().length < 32) {
            throw new IllegalArgumentException("JWT secret key must be at least 256 bits (32 bytes) long");
        }
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MILLISECONDS))
                .signWith(Keys.hmacShaKeyFor(secretKey.getBytes()), Jwts.SIG.HS256)
                .compact();
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(secretKey.getBytes()))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new com.shivam.digital_wallet.exception.InvalidTokenException("Token has expired", e);
        } catch (JwtException e) {
            throw new com.shivam.digital_wallet.exception.InvalidTokenException("Invalid token", e);
        }
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public boolean isTokenValid(String token, String email) {
        try {
            String extractedEmail = extractEmail(token);
            boolean emailMatches = extractedEmail.equals(email);
            boolean notExpired = !isTokenExpired(token);
            return emailMatches && notExpired;
        } catch (Exception e) {
            return false;
        }
    }

    public long getExpirationTime() {
        return JWT_EXPIRATION_MILLISECONDS / 1000;
    }
}
