package com.AL565.prose.service.dto;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Stage;
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

    public static StageSimpleDTO toDTO(Stage stage, Employeur employeur) {
        return StageSimpleDTO.builder()
                .title(stage.getTitle())
                .description(stage.getDescription())
                .requirements(stage.getRequirements())
                .workMode(stage.getWorkMode())
                .location(stage.getLocation())
                .compensation(stage.getCompensation())
                .startDate(stage.getStartDate())
                .endDate(stage.getEndDate())
                .skills(stage.getSkills())
                .employeur(EmployeurDTO.toDTOTokenless(employeur))
                .build();
    }
}
