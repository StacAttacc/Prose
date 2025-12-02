package com.AL565.prose.service.dto;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EtudiantPasswordDTO extends ProseUserDTO{
    private String discipline;
    private String password;

    public static Etudiant toModel(EtudiantPasswordDTO dto) {
        Credentials credentials = Credentials.builder()
                .username(dto.getEmail())
                .password(dto.getPassword())
                .role(Role.ETUDIANT)
                .build();

        return new Etudiant(dto.getFirstName(), dto.getLastName(), credentials, Discipline.valueOf(dto.getDiscipline()));
    }
}