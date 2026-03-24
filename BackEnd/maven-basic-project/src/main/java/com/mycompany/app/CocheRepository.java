package com.mycompany.app;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CocheRepository extends JpaRepository<Coche, Long> {
    // Consulta SQL se crea automáticamente:
    // SELECT * FROM coche WHERE marca = ?
    List<Coche> findByMarca(String marca);
}