package com.AL565.prose.service.dto;

import com.AL565.prose.model.Evaluation;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class EvaluationDTO {
    private Long id;
    private Long ententeId;
    private Long employeurId;
    private Long etudiantId;

    private String etudiantNom;
    private String etudiantPrenom;
    private String employeurNom;
    private String stageTitle;

    private Integer productivite;
    private Integer qualiteTravail;
    private Integer relationsInterpersonnelles;
    private Integer habiletesPersonnelles;
    private Integer appreciationGlobale;

    private String commentaires;
    private String pointsForts;
    private String pointsAmelioration;

    private String heureEncadrement;
    private Boolean gardeContact;
    private Boolean rehireEtudiant;

    private LocalDateTime dateEvaluation;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    public static EvaluationDTO toDTO(Evaluation evaluation) {
        return EvaluationDTO.builder()
                .id(evaluation.getId())
                .ententeId(evaluation.getEntente().getId())
                .employeurId(evaluation.getEmployeur().getId())
                .etudiantId(evaluation.getEtudiant().getId())
                .etudiantNom(evaluation.getEtudiant().getLastName())
                .etudiantPrenom(evaluation.getEtudiant().getFirstName())
                .employeurNom(evaluation.getEmployeur().getCompany())
                .stageTitle(evaluation.getEntente().getCandidature().getStage().getTitle())
                .productivite(evaluation.getProductivite())
                .qualiteTravail(evaluation.getQualiteTravail())
                .relationsInterpersonnelles(evaluation.getRelationsInterpersonnelles())
                .habiletesPersonnelles(evaluation.getHabiletesPersonnelles())
                .appreciationGlobale(evaluation.getAppreciationGlobale())
                .commentaires(evaluation.getCommentaires())
                .pointsForts(evaluation.getPointsForts())
                .pointsAmelioration(evaluation.getPointsAmelioration())
                .heureEncadrement(evaluation.getHeureEncadrement())
                .gardeContact(evaluation.getGardeContact())
                .rehireEtudiant(evaluation.getRehireEtudiant())
                .dateEvaluation(evaluation.getDateEvaluation())
                .dateCreation(evaluation.getDateCreation())
                .dateModification(evaluation.getDateModification())
                .build();
    }
}