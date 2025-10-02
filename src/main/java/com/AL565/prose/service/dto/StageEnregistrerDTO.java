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
        Stage stage = new Stage();
        stage.setTitle(dto.getTitle());
        stage.setDescription(dto.getDescription());
        stage.setRequirements(dto.getRequirements());
        stage.setSkills(dto.getSkills());
        stage.setStartDate(dto.getStartDate());
        stage.setEndDate(dto.getEndDate());
        stage.setLocation(dto.getLocation());
        stage.setWorkMode(dto.getWorkMode());
        stage.setCompensation(dto.getCompensation());
        stage.setEmployeur(employeur);
        stage.setStatus(OfferStatus.SOUMISE);
        return stage;
    }
}
