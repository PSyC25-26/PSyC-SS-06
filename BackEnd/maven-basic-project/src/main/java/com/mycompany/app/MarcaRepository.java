package com.mycompany.app;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarcaRepository extends JpaRepository<Marca, Long> {
    // Consulta SQL se crea automáticamente:
    // SELECT * FROM marca WHERE country = ?
    List<Marca> findByCountry(String country);

    // Para validar que no se repita el nombre de marca
    Optional<Marca> findByName(String name);
}