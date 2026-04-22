package com.mycompany.app.security;

import com.mycompany.app.security.JwtAuthenticationFilter;
import com.mycompany.app.security.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.ArrayList;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private FilterChain filterChain;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.clearContext(); // Limpiar el contexto antes de cada test
    }

    @Test
    void testFiltroConTokenValido() throws Exception {
        String token = "token.valido.aqui";
        String userEmail = "aaron@gmail.com";
        UserDetails userDetails = new User(userEmail, "1234567", new ArrayList<>());

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtService.extractUsername(token)).thenReturn(userEmail);
        when(userDetailsService.loadUserByUsername(userEmail)).thenReturn(userDetails);
        when(jwtService.isTokenValid(token, userDetails)).thenReturn(true);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(userEmail, SecurityContextHolder.getContext().getAuthentication().getName());
        
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testFiltroSinCabeceraAuthorization_DeberiaContinuarSinAutenticar() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // NO tiene que haber nadie autenticado
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        
        // Verificar que la petición sigue adelante
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testFiltroConTokenInvalido_NoDeberiaAutenticar() throws Exception {
        String token = "token.falso";
        String userEmail = "aaron@gmail.com";
        UserDetails userDetails = new User(userEmail, "password", new ArrayList<>());

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtService.extractUsername(token)).thenReturn(userEmail);
        when(userDetailsService.loadUserByUsername(userEmail)).thenReturn(userDetails);
        
        // Simulación -> servicio dice que el token NO es válido
        when(jwtService.isTokenValid(token, userDetails)).thenReturn(false);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Verificación de que el contexto sigue vacío
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }
}