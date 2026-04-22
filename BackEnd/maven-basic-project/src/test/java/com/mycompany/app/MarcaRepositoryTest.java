package com.mycompany.app;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class MarcaRepositoryTest {

    @Autowired
    private MarcaRepository marcaRepository;

    @BeforeEach
    void setUp() {
        marcaRepository.deleteAll();
    }

    @Test
    void testGuardarYBuscarMarcaPorId() {
        Marca marca = new Marca("Toyota", "Japon");

        Marca marcaGuardada = marcaRepository.save(marca);
        Optional<Marca> resultado = marcaRepository.findById(marcaGuardada.getId());

        assertTrue(resultado.isPresent());
        assertEquals("Toyota", resultado.get().getName());
        assertEquals("Japon", resultado.get().getCountry());
    }

    @Test
    void testFindByCountryConResultados() {
        marcaRepository.save(new Marca("Toyota", "Japon"));
        marcaRepository.save(new Marca("Honda", "Japon"));
        marcaRepository.save(new Marca("Ford", "Estados Unidos"));

        List<Marca> resultado = marcaRepository.findByCountry("Japon");

        assertEquals(2, resultado.size());
        assertTrue(resultado.stream().allMatch(marca -> "Japon".equals(marca.getCountry())));
    }

    @Test
    void testFindByCountrySinResultados() {
        marcaRepository.save(new Marca("Seat", "Espana"));

        List<Marca> resultado = marcaRepository.findByCountry("Italia");

        assertTrue(resultado.isEmpty());
    }

    @Test
    void testEliminarMarca() {
        Marca marca = marcaRepository.save(new Marca("Renault", "Francia"));

        marcaRepository.deleteById(marca.getId());
        Optional<Marca> resultado = marcaRepository.findById(marca.getId());

        assertTrue(resultado.isEmpty());
    }
}
