package com.mycompany.app;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mycompany.app.security.JwtService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping({"/api/usuarios", "/api/clientes"})
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, AuthenticationManager authenticationManager, UserDetailsService userDetailsService, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioID(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        if (usuario != null) {
            return new ResponseEntity<>(usuario, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Obtener usuarios por rol
    @GetMapping("/admin/{esAdmin}")
    public ResponseEntity<List<Usuario>> obtenerUsuariosPorAdmin(@PathVariable boolean esAdmin) {
        List<Usuario> usuarios = usuarioRepository.findByEsAdmin(esAdmin);
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }


    // POST - crear cliente/usuario
    @PostMapping("/register")
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario usuario) {

        // Encriptación contraseña
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(usuario.getEmail());

        if (usuarioExistente.isPresent()) {
            return new ResponseEntity<>("Ya existe un usuario con ese email", HttpStatus.CONFLICT);
        }

        if (!usuario.isEsAdmin()) {
            usuario.setEsAdmin(false);
        }
        Usuario nuevoUsuario = usuarioRepository.save(usuario);
        return new ResponseEntity<>(nuevoUsuario, HttpStatus.CREATED);
    }


    // PUT - actualizar cliente/usuario
    @PutMapping("/update/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario datosActualizados) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findById(id);

        if (usuarioOptional.isEmpty()) {
            return new ResponseEntity<>("Usuario no encontrado", HttpStatus.NOT_FOUND);
        }

        Usuario usuario = usuarioOptional.get();

        // validar email duplicado solo si cambia
        if (datosActualizados.getEmail() != null &&
            !datosActualizados.getEmail().equals(usuario.getEmail())) {

            Optional<Usuario> usuarioConEseEmail = usuarioRepository.findByEmail(datosActualizados.getEmail());
            if (usuarioConEseEmail.isPresent()) {
                return new ResponseEntity<>("Ya existe un usuario con ese email", HttpStatus.CONFLICT);
            }
        }

        usuario.setNombre(datosActualizados.getNombre());
        usuario.setEmail(datosActualizados.getEmail());

        // Solo actualizar la password si llega una nueva en el body, y siempre cifrada con BCrypt
        if (datosActualizados.getPassword() != null && !datosActualizados.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(datosActualizados.getPassword()));
        }

        usuario.setEsAdmin(datosActualizados.isEsAdmin());

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return new ResponseEntity<>(usuarioGuardado, HttpStatus.OK);
    }

    // DELETE - borrar cliente/usuario
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findById(id);

        if (usuarioOptional.isEmpty()) {
            return new ResponseEntity<>("Usuario no encontrado", HttpStatus.NOT_FOUND);
        }

        usuarioRepository.deleteById(id);
        return new ResponseEntity<>("Usuario eliminado correctamente", HttpStatus.OK);
    }
}