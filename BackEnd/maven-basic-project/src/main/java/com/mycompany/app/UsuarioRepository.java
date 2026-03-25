package com.mycompany.app;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {



    List<Usuario> findByEsAdmin(boolean esAdmin);
    Optional<Usuario> findByEmail(String email);


}