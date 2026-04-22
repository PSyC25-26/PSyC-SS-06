package com.mycompany.app;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MarcaControllerTest {

    @Mock
    private MarcaRepository marcaRepository;

    @InjectMocks
    private MarcaController marcaController;

    private Marca toyota;
    private Marca ford;

    @BeforeEach
    void setUp() {
        toyota = new Marca("Toyota", "Japon");
        toyota.setId(1L);

        ford = new Marca("Ford", "Estados Unidos");
        ford.setId(2L);
    }

    @Test
    void testObtenerTodasLasMarcasConResultados() {
        List<Marca> marcas = List.of(toyota, ford);
        when(marcaRepository.findAll()).thenReturn(marcas);

        ResponseEntity<List<Marca>> respuesta = marcaController.obtenerTodasLasMarcas();

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertSame(marcas, respuesta.getBody());
        assertEquals(2, respuesta.getBody().size());
        assertEquals("Toyota", respuesta.getBody().get(0).getName());
        verify(marcaRepository, times(1)).findAll();
    }

    @Test
    void testObtenerTodasLasMarcasSinResultados() {
        when(marcaRepository.findAll()).thenReturn(List.of());

        ResponseEntity<List<Marca>> respuesta = marcaController.obtenerTodasLasMarcas();

        assertEquals(HttpStatus.NO_CONTENT, respuesta.getStatusCode());
        assertNull(respuesta.getBody());
        verify(marcaRepository, times(1)).findAll();
    }

    @Test
    void testObtenerMarcaPorIdExistente() {
        when(marcaRepository.findById(1L)).thenReturn(Optional.of(toyota));

        ResponseEntity<Marca> respuesta = marcaController.obtenerMarcaID(1L);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertSame(toyota, respuesta.getBody());
        assertEquals("Japon", respuesta.getBody().getCountry());
        verify(marcaRepository, times(1)).findById(1L);
    }

    @Test
    void testObtenerMarcaPorIdInexistente() {
        when(marcaRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<Marca> respuesta = marcaController.obtenerMarcaID(99L);

        assertEquals(HttpStatus.NOT_FOUND, respuesta.getStatusCode());
        assertNull(respuesta.getBody());
        verify(marcaRepository, times(1)).findById(99L);
    }

    @Test
    void testObtenerMarcasPorPaisConResultados() {
        List<Marca> marcas = List.of(toyota);
        when(marcaRepository.findByCountry("Japon")).thenReturn(marcas);

        ResponseEntity<List<Marca>> respuesta = marcaController.obtenerMarcasPorPais("Japon");

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertSame(marcas, respuesta.getBody());
        assertEquals("Toyota", respuesta.getBody().get(0).getName());
        verify(marcaRepository, times(1)).findByCountry("Japon");
    }

    @Test
    void testObtenerMarcasPorPaisSinResultados() {
        when(marcaRepository.findByCountry("Italia")).thenReturn(List.of());

        ResponseEntity<List<Marca>> respuesta = marcaController.obtenerMarcasPorPais("Italia");

        assertEquals(HttpStatus.NO_CONTENT, respuesta.getStatusCode());
        assertNull(respuesta.getBody());
        verify(marcaRepository, times(1)).findByCountry("Italia");
    }
}
