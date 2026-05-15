package com.mycompany.app;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

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

    // POST - Crear marca
    @PostMapping
    public ResponseEntity<?> crearMarca(@RequestBody Marca marca) {
        Optional<Marca> marcaExistente = marcaRepository.findByName(marca.getName());

        if (marcaExistente.isPresent()) {
            return new ResponseEntity<>("Ya existe una marca con ese nombre", HttpStatus.CONFLICT);
        }

        Marca nuevaMarca = marcaRepository.save(marca);
        return new ResponseEntity<>(nuevaMarca, HttpStatus.CREATED);
    }

    // PUT - Actualizar marca por ID
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarMarca(@PathVariable Long id, @RequestBody Marca marcaActualizada) {
        Marca marcaExistente = marcaRepository.findById(id).orElse(null);

        if (marcaExistente == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Validar nombre duplicado solo si el nombre cambia
        if (marcaActualizada.getName() != null
                && !marcaActualizada.getName().equals(marcaExistente.getName())) {

            Optional<Marca> marcaConEseNombre = marcaRepository.findByName(marcaActualizada.getName());
            if (marcaConEseNombre.isPresent()) {
                return new ResponseEntity<>("Ya existe una marca con ese nombre", HttpStatus.CONFLICT);
            }
        }

        marcaExistente.setName(marcaActualizada.getName());
        marcaExistente.setCountry(marcaActualizada.getCountry());
        marcaExistente.setLogoUrl(marcaActualizada.getLogoUrl());

        Marca marcaGuardada = marcaRepository.save(marcaExistente);
        return new ResponseEntity<>(marcaGuardada, HttpStatus.OK);
    }

    // DELETE - Eliminar marca por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMarca(@PathVariable Long id) {
        Marca marcaExistente = marcaRepository.findById(id).orElse(null);

        if (marcaExistente == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        marcaRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
