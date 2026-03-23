package com.mycompany.app;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/coches")
public class CocheController {

    // Necesitamos que el controlador tenga acceso al repositorio para buscar los coches
    private final CocheRepository cocheRepository;

    public CocheController(CocheRepository cocheRepository) {
        this.cocheRepository = cocheRepository;
    }

    // Cuando alguien visite la URL con el método GET, ejecutamos esto:
    @GetMapping
    public List<Coche> obtenerTodosLosCoches() {

        return cocheRepository.findAll();
    }
}