package com.mycompany.app;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Consulta SQL se crea automáticamente:
    // SELECT * FROM usuario WHERE rol = ?
    List<Usuario> findByRol(String rol);
}