package com.mycompany.app;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

<<<<<<< HEAD

=======
    List<Usuario> findByEsAdmin(boolean esAdmin);
>>>>>>> 7464165f8cb218fc4cc31f6a0aea3303a90f1fdd
    Optional<Usuario> findByEmail(String email);

}