package com.AL565.prose.service.dto;

import com.AL565.prose.model.Employeur;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmployeurDTO {
    private long id;
    private String firstName;
    private String lastName;
    private String company;
    private String email;

    public static EmployeurDTO toDTO(Employeur employeur) {
        return new EmployeurDTO(employeur.getId(), employeur.getFirstName(), employeur.getLastName(), employeur.getCompany(), employeur.getEmail());
    }
}
