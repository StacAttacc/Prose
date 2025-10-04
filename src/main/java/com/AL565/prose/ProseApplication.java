package com.AL565.prose;

import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.GestionnaireDTO;
import com.AL565.prose.service.dto.EmployeurEnregistrerDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

@SpringBootApplication
public class ProseApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProseApplication.class, args);
    }


    @Bean
    @Profile({"dev", "local", "test"})
    public CommandLineRunner seedEmployeur(EmployeurService employeurService, GestionnaireService gestionnaireService) {
        return args -> {
            System.out.println("Placeholder");
        };
    }
}
