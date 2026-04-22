package com.mycompany.app;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CocheService {

    private final CocheRepository cocheRepository;

    public CocheService(CocheRepository cocheRepository) {
        this.cocheRepository = cocheRepository;
    }

    public List<Coche> obtenerTodosLosCoches() {
        return cocheRepository.findAll();
    }

    public Optional<Coche> obtenerCochePorId(Long id) {
        return cocheRepository.findById(id);
    }

    public List<Coche> obtenerCochesPorMarca(String marca) {
        return cocheRepository.findByMarca(marca);
    }

    public Coche crearCoche(Coche coche) {
        return cocheRepository.save(coche);
    }

    public Optional<Coche> actualizarCoche(Long id, Coche cocheActualizado) {
        Optional<Coche> cocheExistenteOptional = cocheRepository.findById(id);

        if (cocheExistenteOptional.isEmpty()) {
            return Optional.empty();
        }

        Coche cocheExistente = cocheExistenteOptional.get();
        cocheExistente.setMarca(cocheActualizado.getMarca());
        cocheExistente.setModelo(cocheActualizado.getModelo());
        cocheExistente.setPrecio(cocheActualizado.getPrecio());
        cocheExistente.setAnio(cocheActualizado.getAnio());
        cocheExistente.setStock(cocheActualizado.getStock());

        Coche cocheGuardado = cocheRepository.save(cocheExistente);
        return Optional.of(cocheGuardado);
    }

    public boolean eliminarCoche(Long id) {
        Optional<Coche> cocheExistenteOptional = cocheRepository.findById(id);

        if (cocheExistenteOptional.isEmpty()) {
            return false;
        }

        cocheRepository.deleteById(id);
        return true;
    }
}