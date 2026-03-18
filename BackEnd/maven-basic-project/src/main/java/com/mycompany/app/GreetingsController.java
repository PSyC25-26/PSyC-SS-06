package com.mycompany.app;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class GreetingsController {

    @GetMapping("/greetings")
    public Map<String, String> greetings() {
        return Map.of("message", "Hello and welcome!");
    }
}
