package com.mycompany.app;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarcaRepository extends JpaRepository<Marca, Long> {
    // Consulta SQL se crea automáticamente:
    // SELECT * FROM marca WHERE country = ?
    List<Marca> findByCountry(String country);
}