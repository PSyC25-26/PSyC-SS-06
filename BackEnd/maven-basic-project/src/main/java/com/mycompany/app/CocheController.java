package com.mycompany.app;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RestController
@RequestMapping("/api/coches")
public class CocheController {

    // Necesitamos que el controlador tenga acceso al repositorio para buscar los coches
    private final CocheRepository cocheRepository;

    public CocheController(CocheRepository cocheRepository) {
        this.cocheRepository = cocheRepository;
    }

    // Obtener todos los coches
    @GetMapping
    public List<Coche> obtenerTodosLosCoches() {
        return cocheRepository.findAll();
    }

    // Obtener coche por ID
    @GetMapping("/{id}")
    public Coche obtenerCocheID(@PathVariable Long id) {
        return cocheRepository.findById(id).orElse(null);
    }

    // Obtener coches por marca
    @GetMapping("/marca/{marca}")
    public List<Coche> obtenerCochesMarca(@PathVariable String marca) {
        return cocheRepository.findByMarca(marca);
    }
}