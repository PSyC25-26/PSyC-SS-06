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
    public CommandLineRunner probarBaseDeDatos(CocheRepository cocheRepository) {
        return args -> {
            System.out.println("--- INICIANDO PRUEBA DE BASE DE DATOS ---");

            // 1. Guardamos dos coches en la base de datos
            cocheRepository.save(new Coche("Toyota", "Corolla", 25000.0));
            cocheRepository.save(new Coche("Ford", "Mustang", 45000.0));
            System.out.println("¡Coches guardados con éxito!");

            // 2. Le pedimos al repositorio que nos devuelva todos los coches que existen
            System.out.println("--- LISTA DE COCHES EN EL CONCESIONARIO ---");
            for (Coche coche : cocheRepository.findAll()) {
                System.out.println("ID: " + coche.getId() + " | " + coche.getMarca() + " " + coche.getModelo() + " -> " + coche.getPrecio() + "€");
            }
        };
    }
}