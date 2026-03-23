package com.mycompany.app;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    @Bean
    public CommandLineRunner probarBaseDeDatos(
            CocheRepository cocheRepository,
            UsuarioRepository usuarioRepository,
            MarcaRepository marcaRepository) {
        return args -> {

            marcaRepository.save(new Marca("Toyota", "Japón"));
            marcaRepository.save(new Marca("Ford", "EEUU"));

            cocheRepository.save(new Coche("Toyota", "Corolla", 25000.0, 2023, 5));
            cocheRepository.save(new Coche("Ford", "Mustang", 45000.0, 2024, 2));

            Usuario admin = new Usuario();
            admin.setName("Admin");
            admin.setEmail("admin@autoelite.com");
            admin.setPassword("1234");
            admin.setRol("ADMIN");
            usuarioRepository.save(admin);

            System.out.println("--- DATOS CARGADOS CORRECTAMENTE ---");
        };
    }
}