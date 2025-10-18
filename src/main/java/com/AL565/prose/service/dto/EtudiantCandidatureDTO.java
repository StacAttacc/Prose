package com.AL565.prose.service.dto;

import com.AL565.prose.model.Candidature;
import com.AL565.prose.model.Employeur;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EtudiantCandidatureDTO {
    private StageSimpleDTO stage;
    private String status;
    private LocalDateTime datePostulation;
    private String decision;
    private LocalDateTime dateDecision;

    public static EtudiantCandidatureDTO toDTO (Candidature candidature, Employeur employeur) {
        var stage = candidature.getStage();

        return EtudiantCandidatureDTO.builder()
                .stage(StageSimpleDTO.builder()
                        .title(stage.getTitle())
                        .description(stage.getDescription())
                        .requirements(stage.getRequirements())
                        .workMode(stage.getWorkMode())
                        .location(stage.getLocation())
                        .compensation(stage.getCompensation())
                        .startDate(stage.getStartDate() != null ? stage.getStartDate().toString() : null)
                        .endDate(stage.getEndDate() != null ? stage.getEndDate().toString() : null)
                        .skills(stage.getSkills())
                        .employeur(EmployeurDTO.toDTOTokenless(employeur))
                        .build())
                .status(candidature.getStatus().name())
                .datePostulation(candidature.getDateCandidature())
                .decision(candidature.getDecision())
                .dateDecision(candidature.getDateDecision())
                .build();
    }
}
