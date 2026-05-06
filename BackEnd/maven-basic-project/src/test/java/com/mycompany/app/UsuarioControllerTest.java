package com.mycompany.app;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Optional;

@SpringBootTest
@AutoConfigureMockMvc
public class UsuarioControllerTest {

    private static final Logger log = LoggerFactory.getLogger(UsuarioControllerTest.class);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario usuarioPrueba;


    @BeforeEach
    void setUp() {
        log.info("Limpiando base de datos de usuarios y preparando datos de prueba...");

        usuarioRepository.deleteAll();

        Usuario u = new Usuario();
        u.setNombre("Aaron Aaronson");
        u.setEmail("aaron@gmail.com");
        u.setPassword("1234567");
        u.setEsAdmin(false);

        usuarioPrueba = usuarioRepository.save(u);
    }


    @Test
    void testCrearUsuarioNuevo() throws Exception {
        log.info("Ejecutando test: crearUsuario...");
        Usuario nuevo = new Usuario();
        nuevo.setNombre("Admin");
        nuevo.setEmail("admin@concesionario.com");
        nuevo.setPassword("adminpass");
        nuevo.setEsAdmin(true);

        mockMvc.perform(post("/api/usuarios/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("admin@concesionario.com"));
    }

    @Test
    void testObtenerTodosLosUsuarios() throws Exception {
        log.info("Ejecutando test: obtenerTodosLosUsuarios real...");
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("aaron@gmail.com"));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testObtenerUsuariosPorAdmin() throws Exception {
        log.info("Ejecutando test: obtenerUsuariosPorAdmin...");
        // aaron@gmail.com no es admin (false)
        mockMvc.perform(get("/api/usuarios").param("esAdmin", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Aaron Aaronson"));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testActualizarUsuarioReal() throws Exception {
        log.info("Ejecutando test: actualizarUsuario real...");
        usuarioPrueba.setNombre("Aaron Modificado");

        mockMvc.perform(put("/api/usuarios/update/" + usuarioPrueba.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioPrueba)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Aaron Modificado"));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testEliminarUsuarioReal() throws Exception {
        log.info("Ejecutando test: eliminarUsuario real...");
        mockMvc.perform(delete("/api/usuarios/delete/" + usuarioPrueba.getId()))
                .andExpect(status().isOk())
                .andExpect(content().string("Usuario eliminado correctamente"));

        // Verificar que ya no existe
        mockMvc.perform(get("/api/usuarios/" + usuarioPrueba.getId()))
                .andExpect(status().isNotFound());
    }


    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testObtenerUsuarioPorIdInexistente() throws Exception {
        log.warn("Ejecutando test: obtenerUsuarioID inexistente...");
        mockMvc.perform(get("/api/usuarios/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCrearUsuarioEmailDuplicado() throws Exception {
        log.error("Ejecutando test: crearUsuario con email duplicado...");
        Usuario duplicado = new Usuario();
        duplicado.setNombre("Aaron Braaronson");
        duplicado.setEmail("aaron@gmail.com"); // mismo email que en el setup
        duplicado.setPassword("otro1234567");

        mockMvc.perform(post("/api/usuarios/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicado)))
                .andExpect(status().isConflict()); // 409 Conflict
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testEliminarUsuarioInexistente() throws Exception {
        log.error("Ejecutando test: eliminarUsuario inexistente...");
        
        mockMvc.perform(delete("/api/usuarios/delete/9999"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Usuario no encontrado"));
    }


    @Test
    void testObtenerTodosLosUsuariosVacio() throws Exception {
        log.info("Ejecutando test: obtenerTodosLosUsuarios (Caso lista vacía)...");
        usuarioRepository.deleteAll(); // Vaciamos adrede

        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testActualizarUsuarioInexistente() throws Exception {
        log.warn("Ejecutando test: actualizarUsuario inexistente...");
        Usuario datosNuevos = new Usuario();
        datosNuevos.setNombre("Fantasma");
        datosNuevos.setEmail("noexist@gmail.com");

        mockMvc.perform(put("/api/usuarios/update/9999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(datosNuevos)))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Usuario no encontrado"));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testActualizarUsuarioEmailEnUso() throws Exception {
        log.error("Ejecutando test: actualizarUsuario a email ya en uso...");
        
        Usuario otroUsuario = new Usuario();
        otroUsuario.setNombre("Segundo Usuario");
        otroUsuario.setEmail("segundo@gmail.com");
        otroUsuario.setPassword("pass");
        usuarioRepository.save(otroUsuario);

        usuarioPrueba.setEmail("segundo@gmail.com");

        mockMvc.perform(put("/api/usuarios/update/" + usuarioPrueba.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(usuarioPrueba)))
                .andExpect(status().isConflict())
                .andExpect(content().string("Ya existe un usuario con ese email"));
    }
}