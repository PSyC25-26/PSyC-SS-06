package com.mycompany.app;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Carga datos iniciales en la base de datos al arrancar la aplicación.
 * Está en un componente aparte para que los tests de repositorio
 * (@DataJpaTest) no lo carguen y no requieran la configuración de seguridad.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final CocheRepository cocheRepository;
    private final UsuarioRepository usuarioRepository;
    private final MarcaRepository marcaRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CocheRepository cocheRepository,
                           UsuarioRepository usuarioRepository,
                           MarcaRepository marcaRepository,
                           PasswordEncoder passwordEncoder) {
        this.cocheRepository = cocheRepository;
        this.usuarioRepository = usuarioRepository;
        this.marcaRepository = marcaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Sembrar marcas y coches solo si están vacíos para evitar duplicados al reiniciar
        if (marcaRepository.count() == 0) {
            marcaRepository.save(new Marca("Toyota", "Japón"));
            marcaRepository.save(new Marca("Ford", "EEUU"));
        }

        if (cocheRepository.count() == 0) {
            cocheRepository.save(new Coche("Toyota", "Corolla", 25000.0, 2023, 5));
            cocheRepository.save(new Coche("Ford", "Mustang", 45000.0, 2024, 2));
        }

        // Crear admin solo si no existe; la password se cifra con BCrypt para que el login funcione
        if (usuarioRepository.findByEmail("admin@autoelite.com").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setNombre("Admin");
            admin.setApellidos("Principal");
            admin.setEmail("admin@autoelite.com");
            admin.setPassword(passwordEncoder.encode("1234"));
            admin.setTelefono("600000000");
            admin.setEsAdmin(true);
            usuarioRepository.save(admin);
        }

        System.out.println("--- DATOS CARGADOS CORRECTAMENTE ---");
    }
}
