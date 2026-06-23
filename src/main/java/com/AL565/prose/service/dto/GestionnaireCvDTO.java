package com.AL565.prose.service.dto;

import com.AL565.prose.model.CV;
import lombok.*;

import java.util.Base64;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GestionnaireCvDTO {
    private Long id;
    private String name;
    private String type;
    private String etudiantPrenom;
    private String etudiantNom;
    private String etudiantEmail;
    private String discipline;
    private String status;
    private String data;
    private String comment;

    public static GestionnaireCvDTO toMetadataDto(CV cv) {
        return new GestionnaireCvDTO(
                cv.getId(),
                cv.getName(),
                cv.getType(),
                cv.getEtudiant().getFirstName(),
                cv.getEtudiant().getLastName(),
                cv.getEtudiant().getEmail(),
                cv.getEtudiant().getDiscipline().name(),
                cv.getStatus().name(),
                null,
                cv.getComment());
    }

    public static GestionnaireCvDTO toDto(CV cv) {
        GestionnaireCvDTO dto = toMetadataDto(cv);
        dto.setData(Base64.getEncoder().encodeToString(cv.getData()));
        return dto;
    }
}