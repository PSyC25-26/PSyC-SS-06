package com.mycompany.app.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value; // para @Value
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;

@Service
public class JwtService {

    // (clave iría en application.properties para seguridad)
    // Clave secreta HS256 [mínimo 256 bits / 32 caracteres]
    private static final String SECRET_KEY = "InsertarAquiClaveOmegaSecretaOmegaLargaEpicaQueContieneAlMenos256BitsDeCaracteresNormalesSinTildesNiEspaciosYTalYCualCreoQueSeEntiendeXd";

    // Inyectar valor desde application.properties si se añade ahí
    // @Value("${jwt.secret}")
    // private String secretKey;

    public String generateToken(UserDetails userDetails) {
        int duracion = 1000 * 60 * 5; // tiempo en milisegundos que el token durará hasta el timeout, actualmente 5 minutos
        return Jwts.builder()
                .setClaims(new HashMap<>())
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + duracion))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }


    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }


    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}