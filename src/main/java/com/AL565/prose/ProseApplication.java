package com.AL565.prose;

import com.AL565.prose.service.DTO.EmployeurEnregistrerDTO;
import com.AL565.prose.service.EmployeurService;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@AllArgsConstructor
@SpringBootApplication
public class ProseApplication {

    private final EmployeurService employeurService;

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

            employeurService.enregistrer(employeurMark);

            System.out.println(employeurService.getEmployeur("mcarney@gov.ca"));
        };
    }
}
