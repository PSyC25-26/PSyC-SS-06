package com.mycompany.app;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class CocheRepositoryTest {

    @Autowired
    private CocheRepository cocheRepository;

    @BeforeEach
    void setUp() {
        cocheRepository.deleteAll();
    }

    @Test
    void testGuardarYBuscarCochePorId() {
        Coche coche = new Coche("Toyota", "Corolla", 25000.0, 2023, 5);

        Coche cocheGuardado = cocheRepository.save(coche);
        Optional<Coche> resultado = cocheRepository.findById(cocheGuardado.getId());

        assertTrue(resultado.isPresent());
        assertEquals("Toyota", resultado.get().getMarca());
        assertEquals("Corolla", resultado.get().getModelo());
        assertEquals(25000.0, resultado.get().getPrecio());
        assertEquals(2023, resultado.get().getAnio());
        assertEquals(5, resultado.get().getStock());
    }

    @Test
    void testFindByMarcaConResultados() {
        cocheRepository.save(new Coche("Ford", "Focus", 15000.0, 2020, 10));
        cocheRepository.save(new Coche("Ford", "Mustang", 45000.0, 2024, 2));
        cocheRepository.save(new Coche("Toyota", "Yaris", 20000.0, 2023, 6));

        List<Coche> resultado = cocheRepository.findByMarca("Ford");

        assertEquals(2, resultado.size());
        assertTrue(resultado.stream().allMatch(coche -> "Ford".equals(coche.getMarca())));
    }

    @Test
    void testFindByMarcaSinResultados() {
        cocheRepository.save(new Coche("Seat", "Ibiza", 18000.0, 2022, 7));

        List<Coche> resultado = cocheRepository.findByMarca("BMW");

        assertTrue(resultado.isEmpty());
    }

    @Test
    void testEliminarCoche() {
        Coche coche = cocheRepository.save(new Coche("Renault", "Clio", 17000.0, 2021, 4));

        cocheRepository.deleteById(coche.getId());
        Optional<Coche> resultado = cocheRepository.findById(coche.getId());

        assertTrue(resultado.isEmpty());
    }
}
