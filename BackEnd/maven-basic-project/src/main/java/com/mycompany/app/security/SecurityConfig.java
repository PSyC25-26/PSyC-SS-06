package com.mycompany.app.security;

import com.mycompany.app.UsuarioRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desactivar CSRF en pro de JWT
            .authorizeHttpRequests(auth -> auth

                // Marcar aquí las rutas HTTP públicas se permiten a todos, el resto requieren autenticación para el acceso
                .requestMatchers("/api/auth/**").permitAll()
                
                .requestMatchers("/ruta/dos/**").permitAll()
                .requestMatchers("/ruta/tres/**").permitAll()
                // etc.
                .requestMatchers("/api/usuarios").permitAll() // para testing, permitir ver todos los usuarios
                .requestMatchers("/h2-console/**").permitAll() // permitir ver base de datos
                .requestMatchers("/error").permitAll() // permitir mostrar los errores correctamente
                
                // NOTA: anyRequest tiene que ir al final para no overwrittear las anteriores
                .anyRequest().hasRole("ADMIN") // Pedir autenticación de tipo ADMIN para el resto de rutas
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Sin estado
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

}