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
            var employeurMark = new EmployeurEnregistrerDTO(
                    "Mark",
                    "Carney",
                    "Gouvernement du Canada",
                    "mcarney@gov.ca",
                    "123456"
            );

            try {
                employeurService.enregistrer(employeurMark);
            } catch (EmailAlreadyExistsException e) {
                System.err.println(e.getMessage());
            }

            System.out.println(employeurService.getEmployeur("mcarney@gov.ca"));

            GestionnaireDTO gestionnaireJane = new GestionnaireDTO();
            gestionnaireJane.setFirstName("admin");
            gestionnaireJane.setLastName("admin");
            gestionnaireJane.setEmail("admin@admin.com");
            gestionnaireJane.setPassword("password123");

            try {
                gestionnaireService.saveGestionnaire(gestionnaireJane);
            } catch (EmailAlreadyExistsException e) {
                System.err.println(e.getMessage());
                System.err.println("gestionnaire pas créé");
            }
        };
    }
}
