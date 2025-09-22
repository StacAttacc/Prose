package com.AL565.prose.service.dto;

import com.AL565.prose.model.Employeur;
import lombok.*;

@Data
@AllArgsConstructor
public class EmployeurEnregistrerDTO {
    private String firstName;
    private String lastName;
    private String company;
    private String email;
    private String password;


    public static Employeur toModel(EmployeurEnregistrerDTO employeurEnregistrerDTO) {
        return new Employeur(employeurEnregistrerDTO.firstName, employeurEnregistrerDTO.lastName, employeurEnregistrerDTO.company, employeurEnregistrerDTO.email, employeurEnregistrerDTO.password);
    }

}
