package com.AL565.prose.service.dto;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Stage;
import com.AL565.prose.model.OfferStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class StageEnregistrerDTO {
    @NotBlank
    @Size(max = 160)
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String requirements;

    private String skillsCsv;
    private LocalDate startDate;
    private LocalDate endDate;

    @Min(1)
    @Max(52)
    private Integer durationWeeks;

    private String location;
    private String workMode;
    private String compensation;
    private List<String> skills;

    public static Stage toModel(StageEnregistrerDTO dto, Employeur employeur) {
        return Stage.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .requirements(dto.getRequirements())
                .skills(dto.skills)
                .startDate(dto.getStartDate())
                .location(dto.getLocation())
                .workMode(dto.getWorkMode())
                .endDate(dto.getEndDate())
                .compensation(dto.getCompensation())
                .employeur(employeur)
                .status(OfferStatus.SOUMISE)  // Critère d’acceptation
                .build();
    }
}
