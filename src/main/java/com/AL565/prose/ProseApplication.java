package com.AL565.prose;

import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.ProfesseurService;
import com.AL565.prose.service.dto.EmployeurPasswordDTO;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.GestionnairePasswordDTO;
import com.AL565.prose.service.dto.ProfesseurPasswordDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import jakarta.validation.ConstraintViolationException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

@AllArgsConstructor
@Slf4j
@SpringBootApplication
public class ProseApplication {

    private final EtudiantService etudiantService;
    private final ProfesseurService professeurService;

    public static void main(String[] args) {
        SpringApplication.run(ProseApplication.class, args);
    }

    @Bean
    @Profile({"dev", "local", "test"})
    public CommandLineRunner seedEmployeur(EmployeurService employeurService, GestionnaireService gestionnaireService) {
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
                log.debug("Seed employeur already exists: {}", e.getMessage());
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
                log.debug("Seed etudiant already exists: {}", e.getMessage());
            }
            
            GestionnairePasswordDTO gestionnaireJane = new GestionnairePasswordDTO();
            gestionnaireJane.setFirstName("Jane");
            gestionnaireJane.setLastName("Doe");
            gestionnaireJane.setEmail("gestionnaire@gestionnaire.com");
            gestionnaireJane.setPassword("password123");

            try {
                gestionnaireService.saveGestionnaire(gestionnaireJane);
            } catch (EmailAlreadyExistsException e) {
                log.debug("Seed gestionnaire already exists: {}", e.getMessage());
            }

            ProfesseurPasswordDTO professeurRobert = new ProfesseurPasswordDTO();
            professeurRobert.setFirstName("Robert");
            professeurRobert.setLastName("Duval");
            professeurRobert.setEmail("professeur@professeur.com");
            professeurRobert.setPassword("password123");
            professeurRobert.setDiscipline("INFORMATIQUE");

            try {
                professeurService.register(professeurRobert);
            } catch (EmailAlreadyExistsException e) {
                log.debug("Seed professeur already exists: {}", e.getMessage());
            } catch (ConstraintViolationException e) {
                e.getConstraintViolations().forEach(v ->
                        log.warn("Seed professeur constraint violation on {}", v.getPropertyPath()));
            }
        };
    }
}