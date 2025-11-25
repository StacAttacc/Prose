package com.AL565.prose.service.dto;

import com.AL565.prose.model.Candidature;
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
    private String stageName;
    private MillieuEvaluationDTO evaluationMillieu;
    private EtudiantDTO etudiant;

    public static CandidatureEvaluationDTO toDTO(Candidature model) {
        return CandidatureEvaluationDTO.builder()
                .id(model.getId())
                .evaluationMillieu(model.getEvaluationMillieu() != null ?
                        MillieuEvaluationDTO.toDTO(model.getEvaluationMillieu())
                        : null)
                .stageName(model.getStageName())
                .etudiant(EtudiantDTO.toDTOTokenless(model.getEtudiant()))
                .build();
    }
}
