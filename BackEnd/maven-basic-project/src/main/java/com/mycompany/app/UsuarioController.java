package com.mycompany.app;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        if (!usuarios.isEmpty()) {
            return new ResponseEntity<>(usuarios, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
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
    @GetMapping("/rol/{rol}")
    public ResponseEntity<List<Usuario>> obtenerUsuariosPorRol(@PathVariable String rol) {
        // Requiere: List<Usuario> findByRol(String rol); en UsuarioRepository
        List<Usuario> usuarios = usuarioRepository.findByRol(rol);
        if (!usuarios.isEmpty()) {
            return new ResponseEntity<>(usuarios, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }


    // POST - crear cliente/usuario
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario usuario) {
        Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(usuario.getEmail());

        if (usuarioExistente.isPresent()) {
            return new ResponseEntity<>("Ya existe un usuario con ese email", HttpStatus.CONFLICT);
        }

        if (usuario.getRol() == null || usuario.getRol().isBlank()) {
            usuario.setRol("CLIENTE");
        }

        Usuario nuevoUsuario = usuarioRepository.save(usuario);
        return new ResponseEntity<>(nuevoUsuario, HttpStatus.CREATED);
    }


    // PUT - actualizar cliente/usuario
    @PutMapping("/{id}")
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
        usuario.setPassword(datosActualizados.getPassword());
        usuario.setRol(datosActualizados.getRol());

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return new ResponseEntity<>(usuarioGuardado, HttpStatus.OK);
    }

    // DELETE - borrar cliente/usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findById(id);

        if (usuarioOptional.isEmpty()) {
            return new ResponseEntity<>("Usuario no encontrado", HttpStatus.NOT_FOUND);
        }

        usuarioRepository.deleteById(id);
        return new ResponseEntity<>("Usuario eliminado correctamente", HttpStatus.OK);
    }
}