package com.AL565.prose.service.dto;

import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.model.Employeur;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntenteDTO {
    private Long id;
    private long candidatureId;
    private EntenteStatus status;
    private LocalDateTime dateCreation;
    private LocalDateTime dateSignatureEtudiant;
    private LocalDateTime dateSignatureEmployeur;
    private LocalDateTime dateSignatureGestionnaire;
    private LocalDateTime dateSignatureComplete;
    
    private EtudiantDTO etudiant;
    private EmployeurDTO employeur;
    private StageDTO stage;

    private long etudiantId;
    private String etudiantNom;
    private String etudiantPrenom;
    private String discipline;
    private long employeurId;
    private long stageId;
    private String stageTitle;
    private String year;
    private boolean hasEvaluation;

    public static EntenteDTO toDTO(Entente entente, Employeur employeur) {
        if (entente == null) return null;

        EntenteDTO dto = EntenteDTO.builder()
                .id(entente.getId())
                .candidatureId(entente.getCandidature().getId())
                .employeurId(employeur.getId())
                .stageId(entente.getStage().getId())
                .stageTitle(entente.getStage().getTitle())
                .stageId(entente.getStage().getId())
                .status(entente.getStatus())
                .year(String.valueOf(entente.getDateCreation().getYear()))
                .dateCreation(entente.getDateCreation())
                .dateSignatureEtudiant(entente.getDateSignatureEtudiant())
                .dateSignatureEmployeur(entente.getDateSignatureEmployeur())
                .dateSignatureGestionnaire(entente.getDateSignatureGestionnaire())
                .dateSignatureComplete(entente.getDateSignatureComplete())
                .hasEvaluation(false)
                .build();


        if (entente.getCandidature() != null) {
            var candidature = entente.getCandidature();
            if (candidature.getEtudiant() != null) {
                dto.setEtudiant(EtudiantDTO.toDTOTokenless(candidature.getEtudiant()));
                dto.setDiscipline(String.valueOf(dto.getEtudiant().getDiscipline()));
                dto.setEtudiantId(entente.getEtudiant().getId());
                dto.setEtudiantPrenom(entente.getEtudiant().getFirstName());
                dto.setEtudiantNom(entente.getEtudiant().getLastName());
            }
            if (candidature.getStage() != null) {
                dto.setStage(StageDTO.toDTO(candidature.getStage(), employeur));
            }
        }

        if (!entente.getEvaluations().isEmpty()) {
            entente.getEvaluations().forEach((evaluation) -> {
                if (evaluation.getEtudiant().getId() == dto.getEtudiantId()) {
                    dto.setHasEvaluation(true);
                }
            });
        }

        return dto;
    }
}
