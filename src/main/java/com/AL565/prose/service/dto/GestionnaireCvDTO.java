package com.AL565.prose.service.dto;

import com.AL565.prose.model.CV;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Base64;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GestionnaireCvDTO {
    private Long id;
    private String name;
    private String etudiantPrenom;
    private String etudiantNom;
    private String etudiantEmail;
    private Date approvedAt;
    private Date rejectedAt;
    private String data;

    public static GestionnaireCvDTO toDto(CV cv) {
        return new GestionnaireCvDTO(
                cv.getId(),
                cv.getName(),
                cv.getEtudiant().getFirstName(),
                cv.getEtudiant().getLastName(),
                cv.getEtudiant().getEmail(),
                cv.getApprovedAt(),
                cv.getRejectedAt(),
                Base64.getEncoder().encodeToString(cv.getData()));
    }
}
