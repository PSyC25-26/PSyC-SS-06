package com.mycompany.app.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import javax.crypto.SecretKey;
import java.lang.reflect.Field;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        userDetails = User.withUsername("test@correo.com")
                .password("1234")
                .authorities("USER")
                .build();
    }

    @Test
    void testGenerateToken() {
        String token = jwtService.generateToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void testExtractUsername() {
        String token = jwtService.generateToken(userDetails);

        String username = jwtService.extractUsername(token);

        assertEquals("test@correo.com", username);
    }

    @Test
    void testIsTokenValid() {
        String token = jwtService.generateToken(userDetails);

        boolean valido = jwtService.isTokenValid(token, userDetails);

        assertTrue(valido);
    }

    @Test
    void testIsTokenInvalidForDifferentUser() {
        String token = jwtService.generateToken(userDetails);

        UserDetails otroUsuario = User.withUsername("otro@correo.com")
                .password("1234")
                .authorities("USER")
                .build();

        boolean valido = jwtService.isTokenValid(token, otroUsuario);

        assertFalse(valido);
    }

    @Test
    void testExpiredTokenIsInvalid() throws Exception {
        String expiredToken = generarTokenExpirado("test@correo.com");

        assertThrows(io.jsonwebtoken.ExpiredJwtException.class, () -> {
            jwtService.isTokenValid(expiredToken, userDetails);
        }, "Debería lanzar ExpiredJwtException porque el token ha caducado");
    }

    private String generarTokenExpirado(String username) throws Exception {
        Field secretField = JwtService.class.getDeclaredField("SECRET_KEY");
        secretField.setAccessible(true);
        String secretKey = (String) secretField.get(null);

        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis() - 1000 * 60 * 10))
                .expiration(new Date(System.currentTimeMillis() - 1000 * 60 * 5))
                .signWith(key)
                .compact();
    }
}