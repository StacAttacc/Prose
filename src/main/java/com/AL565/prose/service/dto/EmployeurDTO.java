package com.AL565.prose.service.dto;

import com.AL565.prose.model.Employeur;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeurDTO extends ProseUserDTO {
    private String company;

    public EmployeurDTO(Employeur employeur, String token) {
        super(employeur.getId(), employeur.getFirstName(), employeur.getLastName(), employeur.getEmail(), employeur.getRole(), token);
        company = employeur.getCompany();
    }

    public static EmployeurDTO toDTO(Employeur employeur, String token) {
        return new EmployeurDTO(employeur, token);
    }

    public static EmployeurDTO toDTOTokenless(Employeur employeur) {
        return new EmployeurDTO(employeur, null);
    }

    public static Employeur toModel(EmployeurDTO employeurDTO) {
        return new Employeur(employeurDTO.getId(), employeurDTO.getFirstName(), employeurDTO.getLastName(), employeurDTO.getCompany(), employeurDTO.getEmail());
    }
}
