package com.mycompany.app;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class UsuarioRepositoryTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
    }

    @Test
    void testGuardarYBuscarUsuarioPorId() {
        Usuario usuario = new Usuario(
                "Ana",
                "Garcia",
                "ana@test.com",
                "123456",
                "600111222",
                false
        );

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        Optional<Usuario> resultado = usuarioRepository.findById(usuarioGuardado.getId());

        assertTrue(resultado.isPresent());
        assertEquals("Ana", resultado.get().getNombre());
        assertEquals("Garcia", resultado.get().getApellidos());
        assertEquals("ana@test.com", resultado.get().getEmail());
        assertEquals("123456", resultado.get().getPassword());
        assertEquals("600111222", resultado.get().getTelefono());
        assertFalse(resultado.get().isEsAdmin());
    }

    @Test
    void testFindByEmailConResultado() {
        usuarioRepository.save(new Usuario(
                "Admin",
                "Principal",
                "admin@test.com",
                "adminpass",
                "600000000",
                true
        ));

        Optional<Usuario> resultado = usuarioRepository.findByEmail("admin@test.com");

        assertTrue(resultado.isPresent());
        assertEquals("Admin", resultado.get().getNombre());
        assertTrue(resultado.get().isEsAdmin());
    }

    @Test
    void testFindByEmailSinResultado() {
        usuarioRepository.save(new Usuario(
                "Luis",
                "Lopez",
                "luis@test.com",
                "pass",
                "600333444",
                false
        ));

        Optional<Usuario> resultado = usuarioRepository.findByEmail("noexiste@test.com");

        assertTrue(resultado.isEmpty());
    }

    @Test
    void testFindByEsAdminConResultados() {
        usuarioRepository.save(new Usuario("Admin", "Uno", "admin1@test.com", "pass", "600000001", true));
        usuarioRepository.save(new Usuario("Admin", "Dos", "admin2@test.com", "pass", "600000002", true));
        usuarioRepository.save(new Usuario("Cliente", "Uno", "cliente@test.com", "pass", "600000003", false));

        List<Usuario> resultado = usuarioRepository.findByEsAdmin(true);

        assertEquals(2, resultado.size());
        assertTrue(resultado.stream().allMatch(Usuario::isEsAdmin));
    }

    @Test
    void testFindByEsAdminSinResultados() {
        usuarioRepository.save(new Usuario("Cliente", "Uno", "cliente1@test.com", "pass", "600000001", false));
        usuarioRepository.save(new Usuario("Cliente", "Dos", "cliente2@test.com", "pass", "600000002", false));

        List<Usuario> resultado = usuarioRepository.findByEsAdmin(true);

        assertTrue(resultado.isEmpty());
    }

    @Test
    void testEliminarUsuario() {
        Usuario usuario = usuarioRepository.save(new Usuario(
                "Marta",
                "Perez",
                "marta@test.com",
                "pass",
                "600555666",
                false
        ));

        usuarioRepository.deleteById(usuario.getId());
        Optional<Usuario> resultado = usuarioRepository.findById(usuario.getId());

        assertTrue(resultado.isEmpty());
    }
}
