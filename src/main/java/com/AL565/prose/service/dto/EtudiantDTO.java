package com.AL565.prose.service.dto;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.auth.Credentials;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EtudiantDTO extends ProseUserDTO {
    private Discipline discipline;

    public EtudiantDTO(Etudiant model, String token) {
        super(model.getId(), model.getFirstName(), model.getLastName(), model.getEmail(), model.getRole(), token);
        this.discipline = model.getDiscipline();
    }

    public static EtudiantDTO toDTO(Etudiant model, String token) {
        return new EtudiantDTO(model, token);
    }

    public static EtudiantDTO toDTOTokenless(Etudiant employeur) {
        return new EtudiantDTO(employeur, null);
    }

    public static Etudiant toModel(EtudiantDTO dto) {
        Credentials credentials = new Credentials();
        credentials.setUsername(dto.getEmail());

        return new Etudiant(
            dto.getFirstName(),
            dto.getLastName(),
            credentials,
            dto.getDiscipline()
        );
    }
}