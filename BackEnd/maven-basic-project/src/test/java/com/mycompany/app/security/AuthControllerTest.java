package com.mycompany.app.security;

import com.mycompany.app.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthController authController;

    private TestJwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new TestJwtService();
        authController = new AuthController(
                authenticationManager,
                userDetailsService,
                jwtService,
                usuarioRepository,
                passwordEncoder
        );
    }

    @Test
    void testLoginCorrectoDevuelveToken() {
        Map<String, String> loginRequest = Map.of(
                "email", "user@test.com",
                "password", "123456"
        );
        UserDetails userDetails = User.withUsername("user@test.com")
                .password("123456")
                .roles("USER")
                .build();

        when(userDetailsService.loadUserByUsername("user@test.com")).thenReturn(userDetails);

        ResponseEntity<?> respuesta = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertTrue(respuesta.getBody() instanceof Map);
        assertEquals("jwt-token", ((Map<?, ?>) respuesta.getBody()).get("token"));
        assertSame(userDetails, jwtService.getLastUserDetails());
        assertEquals(1, jwtService.getGenerateTokenCalls());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userDetailsService, times(1)).loadUserByUsername("user@test.com");
    }

    @Test
    void testLoginIncorrectoDevuelveUnauthorized() {
        Map<String, String> loginRequest = Map.of(
                "email", "user@test.com",
                "password", "wrong-password"
        );
        doThrow(new BadCredentialsException("Credenciales incorrectas"))
                .when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        ResponseEntity<?> respuesta = authController.login(loginRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, respuesta.getStatusCode());
        assertTrue(String.valueOf(respuesta.getBody()).startsWith("Error:"));
        assertTrue(String.valueOf(respuesta.getBody()).contains("incorrectos"));
        assertEquals(0, jwtService.getGenerateTokenCalls());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userDetailsService, never()).loadUserByUsername(any());
    }

    @Test
    void testEliminarTodosBorraUsuariosYDevuelveOk() {
        ResponseEntity<String> respuesta = authController.eliminarTodos();

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals("Base de datos refactorizada", respuesta.getBody());
        verify(usuarioRepository, times(1)).deleteAll();
    }

    private static class TestJwtService extends JwtService {
        private int generateTokenCalls;
        private UserDetails lastUserDetails;

        @Override
        public String generateToken(UserDetails userDetails) {
            generateTokenCalls++;
            lastUserDetails = userDetails;
            return "jwt-token";
        }

        int getGenerateTokenCalls() {
            return generateTokenCalls;
        }

        UserDetails getLastUserDetails() {
            return lastUserDetails;
        }
    }
}
