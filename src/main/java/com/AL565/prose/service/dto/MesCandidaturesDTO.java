package com.AL565.prose.service.dto;

import com.AL565.prose.model.Candidature;
import com.AL565.prose.model.Employeur;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MesCandidaturesDTO {
    private StageInfoDTO stage;
    private String status;
    private LocalDateTime datePostulation;
    private String decision;
    private LocalDateTime dateDecision;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StageInfoDTO {
        private String title;
        private String description;
        private String requirements;
        private String workMode;
        private String location;
        private String compensation;
        private String startDate;
        private String endDate;
        private List<String> skills;
        private EmployeurInfoDTO employeur;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmployeurInfoDTO {
        private String company;
        private String firstName;
        private String lastName;
        private  String email;
    }

    public static MesCandidaturesDTO toDTO (Candidature candidature, Employeur employeur) {
        var stage = candidature.getStage();

        return MesCandidaturesDTO.builder()
                .stage(StageInfoDTO.builder()
                        .title(stage.getTitle())
                        .description(stage.getDescription())
                        .requirements(stage.getRequirements())
                        .workMode(stage.getWorkMode())
                        .location(stage.getLocation())
                        .compensation(stage.getCompensation())
                        .startDate(stage.getStartDate() != null ? stage.getStartDate().toString() : null)
                        .endDate(stage.getEndDate() != null ? stage.getEndDate().toString() : null)
                        .skills(stage.getSkills())
                        .employeur(EmployeurInfoDTO.builder()
                                .company(employeur.getCompany())
                                .firstName(employeur.getFirstName())
                                .lastName(employeur.getLastName())
                                .email(employeur.getEmail())
                                .build())
                        .build())
                .status(candidature.getStatus().name())
                .datePostulation(candidature.getDateCandidature())
                .decision(candidature.getDecision())
                .dateDecision(candidature.getDateDecision())
                .build();
    }
}
