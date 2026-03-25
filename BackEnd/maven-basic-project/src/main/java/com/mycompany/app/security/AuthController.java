package com.mycompany.app.security;

import com.mycompany.app.Usuario;
import com.mycompany.app.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // Actualizamos el constructor con los nuevos parámetros
    public AuthController(AuthenticationManager authenticationManager, UserDetailsService userDetailsService, JwtService jwtService, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Registro de usuario
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestParam (required = true) String name, @RequestParam (required = true) String email, @RequestParam (required = true) String password, @RequestParam (required = false) String rol) {
        Usuario usuario = new Usuario(name, email, password, rol);

        // Ecriptación contraseña
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        // Rol default "USER"
        if(usuario.getRol() == null || usuario.getRol().isEmpty()){
            usuario.setRol("USER");
        }
        usuarioRepository.save(usuario);
        return ResponseEntity.ok(usuario);
    }

    // login de usuario
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam (required = true) String email, @RequestParam (required = true) String password) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
            final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            final String jwt = jwtService.generateToken(userDetails);
            
            return ResponseEntity.ok(Map.of("token", jwt));
            
        } catch (Exception e) {
            // Valores incorrectos
            return ResponseEntity.status(401).body("Error: Correo o contraseña incorrectos");
        }
    }

    // TESTING para limpiar base de datos
    // Eliminar TODOS los usuarios
    @DeleteMapping("/wipe")
    public ResponseEntity<String> eliminarTodos() {
        usuarioRepository.deleteAll();
        return ResponseEntity.ok("Base de datos refactorizada");
    }
}