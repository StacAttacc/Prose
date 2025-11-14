package com.AL565.prose.service.dto;

import com.AL565.prose.model.Professeur;
import com.AL565.prose.model.auth.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfesseurDTO extends ProseUserDTO{
    private String discipline;
    private String token;

    private ProfesseurDTO(Professeur professeur, String token) {
        super(professeur.getId(), professeur.getFirstName(), professeur.getLastName(), professeur.getEmail(), professeur.getRole(), professeur.getPassword());
        this.discipline = String.valueOf(professeur.getDiscipline());
        this.token = token;
    }

    public static ProfesseurDTO toDTOTokenless(Professeur professeur) {
        return new ProfesseurDTO(professeur, null);
    }
}
