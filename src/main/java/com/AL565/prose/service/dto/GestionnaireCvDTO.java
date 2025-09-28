package com.AL565.prose.service.dto;

import com.AL565.prose.model.CV;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GestionnaireCvDTO {
    private Long id;
    private String name;
    private Long etudiantId;
    private Date approvedAt;
    private Date rejectedAt;

    public static GestionnaireCvDTO toDto(CV cv) {
        return new GestionnaireCvDTO(
                cv.getId(),
                cv.getName(),
                cv.getEtudiant().getId(),
                cv.getApprovedAt(),
                cv.getRejectedAt());
    }
}
