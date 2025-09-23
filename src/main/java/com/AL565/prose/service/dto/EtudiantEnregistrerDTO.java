package com.AL565.prose.service.dto;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EtudiantEnregistrerDTO {
    private String firstName;
    private String lastName;
    private String discipline;
    private String email;
    private String password;

    public static Etudiant toModel(EtudiantEnregistrerDTO dto, String encodedPassword) {
        Credentials credentials = Credentials.builder()
                .username(dto.getEmail())
                .password(encodedPassword)
                .role(Role.ETUDIANT)
                .build();

        Discipline disciplineEnum;
        try {
            disciplineEnum = Discipline.valueOf(dto.getDiscipline());
        } catch (IllegalArgumentException e) {
            disciplineEnum = Discipline.AUTRE;
        }

        return new Etudiant(dto.getFirstName(), dto.getLastName(), credentials, disciplineEnum);
    }
}