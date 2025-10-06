package com.AL565.prose;

import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.dto.EmployeurPasswordDTO;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.GestionnairePasswordDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

@AllArgsConstructor
@SpringBootApplication

public class ProseApplication {

    private final EtudiantService etudiantService;
    private final GestionnaireService gestionnaireService;

    public static void main(String[] args) {
        SpringApplication.run(ProseApplication.class, args);
    }


    @Bean
    @Profile({"dev", "local", "!test"})
    public CommandLineRunner seedEmployeur(EmployeurService employeurService) {
        return args -> {
            EmployeurPasswordDTO employeurRandy = new EmployeurPasswordDTO();
            employeurRandy.setFirstName("Randy");
            employeurRandy.setLastName("Lahey");
            employeurRandy.setCompany("Tech Corp");
            employeurRandy.setEmail("employeur@employeur.com");
            employeurRandy.setPassword("password123");

            try {
                employeurService.enregistrer(employeurRandy);
            } catch (EmailAlreadyExistsException e) {
                System.out.println();
            }

            EtudiantPasswordDTO etudiantJohn = new EtudiantPasswordDTO();
            etudiantJohn.setFirstName("John");
            etudiantJohn.setLastName("Doe");
            etudiantJohn.setEmail("etudiant@etudiant.com");
            etudiantJohn.setPassword("password123");
            etudiantJohn.setDiscipline("INFORMATIQUE");

            try {
                etudiantService.inscrireEtudiant(etudiantJohn);
            } catch (EmailAlreadyExistsException e) {
                System.out.println();
            }

            GestionnairePasswordDTO gestionnaireJane = new GestionnairePasswordDTO();
            gestionnaireJane.setFirstName("Jane");
            gestionnaireJane.setLastName("Doe");
            gestionnaireJane.setEmail("gestionnaire@gestionnaire.com");
            gestionnaireJane.setPassword("password123");

            try {
                gestionnaireService.saveGestionnaire(gestionnaireJane);
            } catch (EmailAlreadyExistsException e) {
                System.out.println();
            }
        };
    }
}