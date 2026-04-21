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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CocheControllerTest {

    private static final Logger log = LoggerFactory.getLogger(CocheControllerTest.class);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CocheRepository cocheRepository;

    private Coche cocheGuardado;
    

    @BeforeEach
    void setUp() {
        cocheRepository.deleteAll(); // Limpiar antes de cada test

        Coche cocheInicial = new Coche("Ford", "Focus", 15000.0, 2020, 10);
        cocheGuardado = cocheRepository.save(cocheInicial);
        log.info("Datos preparados: Coche guardado con ID {}", cocheGuardado.getId());
    }
    

    @Test
    void testObtenerTodosLosCoches() throws Exception {
        log.info("Ejecutando test: obtenerTodosLosCoches...");
        
        mockMvc.perform(get("/api/coches"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void testCrearCoche() throws Exception {
        log.info("Ejecutando test: creación de coche nuevo...");
        
        Coche nuevoCoche = new Coche();
        nuevoCoche.setMarca("Toyota");
        nuevoCoche.setModelo("Yaris");
        nuevoCoche.setPrecio(20000.0);
        nuevoCoche.setAnio(2023);
        nuevoCoche.setStock(5);

        mockMvc.perform(post("/api/coches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoCoche)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.marca").value("Toyota"));
    }


    @Test
    void testObtenerCochePorIdReal() throws Exception {
        log.info("Ejecutando test: obtenerCocheID real...");

        mockMvc.perform(get("/api/coches/" + cocheGuardado.getId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.modelo").value("Focus"));
    }

    @Test
    void testActualizarCocheReal() throws Exception {
        log.info("Ejecutando test: actualizarCoche real...");

        // Modificamos el coche que creamos en el setUp
        cocheGuardado.setPrecio(14000.0);
        cocheGuardado.setStock(8);

        mockMvc.perform(put("/api/coches/" + cocheGuardado.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cocheGuardado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.precio").value(14000.0))
                .andExpect(jsonPath("$.stock").value(8));
    }

    @Test
    void testEliminarCocheReal() throws Exception {
        log.info("Ejecutando test: eliminarCoche real...");

        // Eliminamos el coche real
        mockMvc.perform(delete("/api/coches/" + cocheGuardado.getId()))
                .andExpect(status().isNoContent());

        // Verificamos que realmente se ha borrado intentando buscarlo de nuevo
        mockMvc.perform(get("/api/coches/" + cocheGuardado.getId()))
                .andExpect(status().isNotFound());
    }


    @Test
    void testObtenerCochePorIdInexistente() throws Exception {
        log.warn("Ejecutando test: obtenerCocheID inexistente...");
        
        // Para ID actualmente inexistente (9999)
        mockMvc.perform(get("/api/coches/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testActualizarCocheInexistente() throws Exception {
        log.warn("Ejecutando test: actualizarCoche inexistente...");

        Coche cocheFalso = new Coche("Fake", "Model", 10.0, 2000, 1);

        mockMvc.perform(put("/api/coches/9999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cocheFalso)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testEliminarCocheInexistente() throws Exception {
        log.error("Ejecutando test: eliminarCoche inexistente...");
        
        mockMvc.perform(delete("/api/coches/888"))
                .andExpect(status().isNotFound());
    }
}