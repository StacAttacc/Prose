package com.AL565.prose.service.dto;

import com.AL565.prose.model.Employeur;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeurPasswordDTO extends ProseUserDTO{
    private String company;
    private String password;

    public EmployeurPasswordDTO(Employeur employeur) {
        super(employeur.getId(), employeur.getFirstName(), employeur.getLastName(),  employeur.getEmail(), employeur.getRole(), null);
        this.company = employeur.getCompany();
    }

    public static Employeur toModel(EmployeurPasswordDTO employeurPasswordDTO) {
        return new Employeur(employeurPasswordDTO.getFirstName(), employeurPasswordDTO.getLastName(), employeurPasswordDTO.getCompany(), employeurPasswordDTO.getEmail(), employeurPasswordDTO.getPassword());
    }

}
