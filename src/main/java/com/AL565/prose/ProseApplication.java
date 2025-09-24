package com.AL565.prose;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.dto.EmployeurEnregistrerDTO;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.dto.EtudiantDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@AllArgsConstructor
@SpringBootApplication

public class ProseApplication {

    private final EmployeurService employeurService;
    private final EtudiantService etudiantService;

    public static void main(String[] args) {
        SpringApplication.run(ProseApplication.class, args);
    }

    @Bean
    public CommandLineRunner run() {
        return args -> {
            EmployeurEnregistrerDTO employeurMark = new EmployeurEnregistrerDTO(
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

            EtudiantDTO etudiantJohn = new EtudiantDTO();
            etudiantJohn.setFirstName("John");
            etudiantJohn.setLastName("Doe");
            etudiantJohn.setEmail("john@doe.com");
            etudiantJohn.setPassword("password123");
            etudiantJohn.setDiscipline(Discipline.INFORMATIQUE);

            try {
                etudiantService.inscrireEtudiant(etudiantJohn);
            } catch (EmailAlreadyExistsException e) {
                System.err.println(e.getMessage());
                System.err.println("etudiant pas créé");
            }


            System.out.println(employeurService.getEmployeur("mcarney@gov.ca"));
        };
    }
}