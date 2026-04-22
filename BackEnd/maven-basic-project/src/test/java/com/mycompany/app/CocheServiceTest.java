package com.mycompany.app;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CocheServiceTest {

    @Mock
    private CocheRepository cocheRepository;

    @InjectMocks
    private CocheService cocheService;

    private Coche coche1;
    private Coche coche2;

    @BeforeEach
    void setUp() {
        coche1 = new Coche("Toyota", "Corolla", 25000.0, 2023, 5);
        coche1.setId(1L);

        coche2 = new Coche("Ford", "Mustang", 45000.0, 2024, 2);
        coche2.setId(2L);
    }

    @Test
    void testObtenerTodosLosCoches() {
        when(cocheRepository.findAll()).thenReturn(Arrays.asList(coche1, coche2));

        List<Coche> resultado = cocheService.obtenerTodosLosCoches();

        assertNotNull(resultado);
        assertEquals(2, resultado.size());
        assertEquals("Toyota", resultado.get(0).getMarca());
        verify(cocheRepository, times(1)).findAll();
    }

    @Test
    void testObtenerCochePorIdExistente() {
        when(cocheRepository.findById(1L)).thenReturn(Optional.of(coche1));

        Optional<Coche> resultado = cocheService.obtenerCochePorId(1L);

        assertTrue(resultado.isPresent());
        assertEquals("Corolla", resultado.get().getModelo());
        verify(cocheRepository, times(1)).findById(1L);
    }

    @Test
    void testObtenerCochePorIdInexistente() {
        when(cocheRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Coche> resultado = cocheService.obtenerCochePorId(99L);

        assertTrue(resultado.isEmpty());
        verify(cocheRepository, times(1)).findById(99L);
    }

    @Test
    void testObtenerCochesPorMarca() {
        when(cocheRepository.findByMarca("Toyota")).thenReturn(List.of(coche1));

        List<Coche> resultado = cocheService.obtenerCochesPorMarca("Toyota");

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Toyota", resultado.get(0).getMarca());
        verify(cocheRepository, times(1)).findByMarca("Toyota");
    }

    @Test
    void testCrearCoche() {
        Coche nuevoCoche = new Coche("Seat", "Ibiza", 18000.0, 2022, 7);
        nuevoCoche.setId(3L);

        when(cocheRepository.save(nuevoCoche)).thenReturn(nuevoCoche);

        Coche resultado = cocheService.crearCoche(nuevoCoche);

        assertNotNull(resultado);
        assertEquals("Seat", resultado.getMarca());
        assertEquals("Ibiza", resultado.getModelo());
        verify(cocheRepository, times(1)).save(nuevoCoche);
    }

    @Test
    void testActualizarCocheExistente() {
        Coche datosActualizados = new Coche("Toyota", "Yaris", 21000.0, 2024, 10);

        when(cocheRepository.findById(1L)).thenReturn(Optional.of(coche1));
        when(cocheRepository.save(any(Coche.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<Coche> resultado = cocheService.actualizarCoche(1L, datosActualizados);

        assertTrue(resultado.isPresent());
        assertEquals("Toyota", resultado.get().getMarca());
        assertEquals("Yaris", resultado.get().getModelo());
        assertEquals(21000.0, resultado.get().getPrecio());
        assertEquals(2024, resultado.get().getAnio());
        assertEquals(10, resultado.get().getStock());

        verify(cocheRepository, times(1)).findById(1L);
        verify(cocheRepository, times(1)).save(any(Coche.class));
    }

    @Test
    void testActualizarCocheInexistente() {
        Coche datosActualizados = new Coche("BMW", "M3", 70000.0, 2025, 1);

        when(cocheRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Coche> resultado = cocheService.actualizarCoche(99L, datosActualizados);

        assertTrue(resultado.isEmpty());
        verify(cocheRepository, times(1)).findById(99L);
        verify(cocheRepository, never()).save(any(Coche.class));
    }

    @Test
    void testEliminarCocheExistente() {
        when(cocheRepository.findById(1L)).thenReturn(Optional.of(coche1));

        boolean eliminado = cocheService.eliminarCoche(1L);

        assertTrue(eliminado);
        verify(cocheRepository, times(1)).findById(1L);
        verify(cocheRepository, times(1)).deleteById(1L);
    }

    @Test
    void testEliminarCocheInexistente() {
        when(cocheRepository.findById(99L)).thenReturn(Optional.empty());

        boolean eliminado = cocheService.eliminarCoche(99L);

        assertFalse(eliminado);
        verify(cocheRepository, times(1)).findById(99L);
        verify(cocheRepository, never()).deleteById(anyLong());
    }
}