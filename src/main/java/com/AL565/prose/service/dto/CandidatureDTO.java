package com.AL565.prose.service.dto;

import com.AL565.prose.model.CV;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Postulation;
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

    public Postulation toPostulation(Etudiant etudiant, CV cv, Stage stage) {
        return Postulation.builder()
                .etudiant(etudiant)
                .cv(cv)
                .stage(stage)
                .motivationLetter(this.motivationLetterData)
                .datePostulation(LocalDateTime.now())
                .status(OfferStatus.SOUMISE)
                .build();
    }
}
