package com.mycompany.app.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.app.Coche;
import com.mycompany.app.Usuario;
import com.mycompany.app.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de integración end-to-end del flujo de autenticación con JWT.
 * Recorre la cadena Controller -> Service -> Repository -> Security Filter Chain
 * con peticiones HTTP simuladas a través de MockMvc, sin desactivar la seguridad.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "admin@autoelite.com";
    private static final String ADMIN_PASSWORD = "1234";

    @BeforeEach
    void asegurarAdminEnLaBaseDeDatos() {
        // Otros tests pueden haber borrado los usuarios; nos aseguramos de que el admin exista
        if (usuarioRepository.findByEmail(ADMIN_EMAIL).isEmpty()) {
            Usuario admin = new Usuario();
            admin.setNombre("Admin");
            admin.setApellidos("Principal");
            admin.setEmail(ADMIN_EMAIL);
            admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
            admin.setTelefono("600000000");
            admin.setEsAdmin(true);
            usuarioRepository.save(admin);
        }
    }

    @Test
    void loginAdminDevuelveJwtValido() throws Exception {
        Map<String, String> loginPayload = Map.of(
                "email", ADMIN_EMAIL,
                "password", ADMIN_PASSWORD
        );

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        String token = extraerToken(result);
        // El token JWT siempre tiene tres partes separadas por puntos: header.payload.signature
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    void loginConCredencialesIncorrectasDevuelveUnauthorized() throws Exception {
        Map<String, String> loginPayload = Map.of(
                "email", ADMIN_EMAIL,
                "password", "password-mala"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rutaAdminSinTokenDevuelveNoAutorizado() throws Exception {
        // /api/usuarios/admin/{esAdmin} requiere rol ADMIN
        mockMvc.perform(get("/api/usuarios/admin/true"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    // Sin token Spring Security devuelve 401 o 403 según la configuración
                    assertThat(status).isIn(401, 403);
                });
    }

    @Test
    void rutaAdminConTokenAdminDevuelveOk() throws Exception {
        String token = obtenerTokenAdmin();

        mockMvc.perform(get("/api/usuarios/admin/true")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void crearCocheConTokenAdminDevuelveCreated() throws Exception {
        String token = obtenerTokenAdmin();

        Coche nuevoCoche = new Coche("Honda", "Civic", 22000.0, 2024, 3);

        mockMvc.perform(post("/api/coches")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevoCoche)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.marca").value("Honda"))
                .andExpect(jsonPath("$.modelo").value("Civic"));
    }

    @Test
    void usuarioNoAdminNoPuedeAccederARutasDeAdmin() throws Exception {
        // 1. Registrar un usuario nuevo (no admin) en el endpoint público
        String emailNuevo = "usuario.basico." + System.currentTimeMillis() + "@test.com";
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre("Usuario");
        nuevoUsuario.setApellidos("Básico");
        nuevoUsuario.setEmail(emailNuevo);
        nuevoUsuario.setPassword("clave-segura-1234");
        nuevoUsuario.setTelefono("600111222");
        nuevoUsuario.setEsAdmin(false);

        mockMvc.perform(post("/api/usuarios/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevoUsuario)))
                .andExpect(status().isCreated());

        // 2. Hacer login con ese usuario
        Map<String, String> loginPayload = Map.of(
                "email", emailNuevo,
                "password", "clave-segura-1234"
        );

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isOk())
                .andReturn();

        String tokenUsuarioBasico = extraerToken(loginResult);

        // 3. Intentar acceder a una ruta de admin con su token: debe denegarse
        mockMvc.perform(get("/api/usuarios/admin/true")
                        .header("Authorization", "Bearer " + tokenUsuarioBasico))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertThat(status).isIn(401, 403);
                });
    }

    // Helpers

    private String obtenerTokenAdmin() throws Exception {
        Map<String, String> loginPayload = Map.of(
                "email", ADMIN_EMAIL,
                "password", ADMIN_PASSWORD
        );

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isOk())
                .andReturn();

        return extraerToken(result);
    }

    private String extraerToken(MvcResult result) throws Exception {
        String responseBody = result.getResponse().getContentAsString();
        JsonNode json = objectMapper.readTree(responseBody);
        return json.get("token").asText();
    }
}
