package com.mycompany.app;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test de la clase principal de la aplicación.
 * Verifica que el contexto de Spring Boot arranca correctamente
 * y que los componentes esenciales están disponibles.
 */
@SpringBootTest
class AppTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void contextoSeCargaCorrectamente() {
        // El contexto de Spring se ha inicializado sin errores
        assertNotNull(context);
    }

    @Test
    void claseAppEstaRegistradaComoBean() {
        // La clase principal está registrada como bean en el contexto
        assertTrue(context.containsBean("app"));
        assertNotNull(context.getBean(App.class));
    }

    @Test
    void repositoriosPrincipalesEstanDisponibles() {
        // Los repositorios JPA se han creado correctamente
        assertNotNull(context.getBean(CocheRepository.class));
        assertNotNull(context.getBean(MarcaRepository.class));
        assertNotNull(context.getBean(UsuarioRepository.class));
    }

    @Test
    void controladoresPrincipalesEstanDisponibles() {
        // Los controladores REST se han registrado en el contexto
        assertNotNull(context.getBean(CocheController.class));
        assertNotNull(context.getBean(MarcaController.class));
        assertNotNull(context.getBean(UsuarioController.class));
    }

    @Test
    void mainNoLanzaExcepcionAlInvocarse() {
        // El método main existe y es invocable sin lanzar excepciones de reflexión
        assertDoesNotThrow(() -> App.class.getMethod("main", String[].class));
    }
}
