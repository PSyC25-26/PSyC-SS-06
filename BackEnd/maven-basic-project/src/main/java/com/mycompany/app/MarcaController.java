package com.mycompany.app;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/marcas")
public class MarcaController {

    private final MarcaRepository marcaRepository;

    public MarcaController(MarcaRepository marcaRepository) {
        this.marcaRepository = marcaRepository;
    }

    // Obtener todas las marcas
    @GetMapping
    public ResponseEntity<List<Marca>> obtenerTodasLasMarcas() {
        List<Marca> marcas = marcaRepository.findAll();
        return new ResponseEntity<>(marcas, HttpStatus.OK);
    }

    // Obtener marca por ID
    @GetMapping("/{id}")
    public ResponseEntity<Marca> obtenerMarcaID(@PathVariable Long id) {
        Marca marca = marcaRepository.findById(id).orElse(null);
        if (marca != null) {
            return new ResponseEntity<>(marca, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Obtener marcas por país (por si acaso, no se sí lo vamos a usar)
    @GetMapping("/pais/{country}")
    public ResponseEntity<List<Marca>> obtenerMarcasPorPais(@PathVariable String country) {
        // Requiere: List<Marca> findByCountry(String country); en MarcaRepository
        List<Marca> marcas = marcaRepository.findByCountry(country);
        return new ResponseEntity<>(marcas, HttpStatus.OK);
    }
}