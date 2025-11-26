package com.AL565.prose.service.dto;

import com.AL565.prose.model.Candidature;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Stage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatureEvaluationDTO {
    private long id;
    private MillieuEvaluationDTO evaluationMillieu;
    private EtudiantDTO etudiant;
    private StageDTO stage;

    public static CandidatureEvaluationDTO toDTO(Candidature model, Employeur employeur) {
        return CandidatureEvaluationDTO.builder()
                .id(model.getId())
                .evaluationMillieu(model.getEvaluationMillieu() != null ?
                        MillieuEvaluationDTO.toDTO(model.getEvaluationMillieu())
                        : null)
                .etudiant(EtudiantDTO.toDTOTokenless(model.getEtudiant()))
                .stage(StageDTO.fromModel(model.getStage(),  employeur))
                .build();
    }
}
