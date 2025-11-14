package com.AL565.prose.service.dto;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.model.Professeur;
import lombok.Data;

@Data
public class ProfesseurPasswordDTO extends ProseUserDTO {
    private String password;
    private String discipline;

    public static Professeur toModel(ProfesseurPasswordDTO dto) {
        return new Professeur(dto.getFirstName(), dto.getLastName(), dto.getEmail(), dto.getPassword(), Discipline.valueOf(dto.getDiscipline().toUpperCase()));
    }
}
