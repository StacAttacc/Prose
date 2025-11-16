package com.AL565.prose.service.dto;

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
}