package com.mycompany.app;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;


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
    public ResponseEntity<List<Coche>> obtenerTodosLosCoches() {
        List<Coche> coches = cocheRepository.findAll();
        if (!coches.isEmpty()) {
            return new ResponseEntity<>(coches, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    // Obtener coche por ID
    @GetMapping("/{id}")
    public ResponseEntity<Coche> obtenerCocheID(@PathVariable Long id) {
        Coche coche = cocheRepository.findById(id).orElse(null);
        if (coche != null) {
            return new ResponseEntity<>(coche, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Obtener coches por marca
    @GetMapping("/marca/{marca}")
    public ResponseEntity<List<Coche>> obtenerCochesMarca(@PathVariable String marca) {
        List<Coche> coches = cocheRepository.findByMarca(marca);
        if (!coches.isEmpty()) {
            return new ResponseEntity<>(coches, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    // POST - Crear coche
    @PostMapping
    public ResponseEntity<Coche> crearCoche(@RequestBody Coche coche) {
        Coche nuevoCoche = cocheRepository.save(coche);
        return new ResponseEntity<>(nuevoCoche, HttpStatus.CREATED);
      }
    

    // PUT - Actualizar coche por ID
    @PutMapping("/{id}")
    public ResponseEntity<Coche> actualizarCoche(@PathVariable Long id, @RequestBody Coche cocheActualizado) {
        Coche cocheExistente = cocheRepository.findById(id).orElse(null);

        if (cocheExistente == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        cocheExistente.setMarca(cocheActualizado.getMarca());
        cocheExistente.setModelo(cocheActualizado.getModelo());
        cocheExistente.setPrecio(cocheActualizado.getPrecio());
        cocheExistente.setAnio(cocheActualizado.getAnio());
        cocheExistente.setStock(cocheActualizado.getStock());

        Coche cocheGuardado = cocheRepository.save(cocheExistente);
        return new ResponseEntity<>(cocheGuardado, HttpStatus.OK);
    }


    // DELETE - Eliminar coche por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCoche(@PathVariable Long id) {
        Coche cocheExistente = cocheRepository.findById(id).orElse(null);

        if (cocheExistente == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        cocheRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}