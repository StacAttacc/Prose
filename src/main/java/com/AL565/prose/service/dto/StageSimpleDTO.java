package com.AL565.prose.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StageSimpleDTO {
    private String title;
    private String description;
    private String requirements;
    private String workMode;
    private String location;
    private String compensation;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> skills;
    private EmployeurDTO employeur;

    public static StageSimpleDTO toDTOfromStageDTO(StageDTO stageDTO) {
       return StageSimpleDTO.builder()
               .title(stageDTO.getTitle())
               .description(stageDTO.getDescription())
               .requirements(stageDTO.getRequirements())
               .workMode(stageDTO.getWorkMode())
               .location(stageDTO.getLocation())
               .compensation(stageDTO.getCompensation())
               .startDate(stageDTO.getStartDate())
               .endDate(stageDTO.getEndDate())
               .skills(stageDTO.getSkills())
               .employeur(stageDTO.getEmployeur())
               .build();
    }
}
