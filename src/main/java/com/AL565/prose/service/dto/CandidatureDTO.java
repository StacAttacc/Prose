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
    private Long id;
    private Long stageId;
    private byte[] motivationLetterData;
    private String motivationLetterFileName;
    private String motivationLetterContentType;
    private long motivationLetterSize;
    private EtudiantDTO etudiant;

    public Candidature toModel(Etudiant etudiant, CV cv, Stage stage) {
        return Candidature.builder()
                .etudiant(etudiant)
                .cv(cv)
                .stage(stage)
                .motivationLetter(this.motivationLetterData)
                .dateCandidature(LocalDateTime.now())
                .status(OfferStatus.SOUMISE)
                .build();
    }

    public static CandidatureDTO toDTO(Candidature candidature) {
        Etudiant etu = candidature.getEtudiant();

        return CandidatureDTO.builder()
                .id(candidature.getId())
                .stageId(candidature.getStage().getId())
                .etudiant(EtudiantDTO.toDTO(etu, null))
                .motivationLetterData(candidature.getMotivationLetter())
                .build();
    }

    public String getEtudiantEmail() {
        return etudiant.getEmail();
    }
}
