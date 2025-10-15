package com.AL565.prose.service.dto;

import com.AL565.prose.model.CV;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Candidature;
import com.AL565.prose.model.Stage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatureDTO {
    private Long stageId;
    private String etudiantEmail;
    private byte[] motivationLetterData;
    private String motivationLetterFileName;
    private String motivationLetterContentType;
    private long motivationLetterSize;

    public Candidature toModel (Etudiant etudiant, CV cv, Stage stage) {
        return Candidature.builder()
                .etudiant(etudiant)
                .cv(cv)
                .stage(stage)
                .motivationLetter(this.motivationLetterData)
                .dateCandidature(LocalDateTime.now())
                .status(OfferStatus.SOUMISE)
                .build();
    }

    public static CandidatureDTO toDTO (Candidature candidature) {
        return CandidatureDTO.builder()
                .stageId(candidature.getStage().getId())
                .etudiantEmail(candidature.getEtudiant().getEmail())
                .motivationLetterData(candidature.getMotivationLetter())
                .build();
    }
}
