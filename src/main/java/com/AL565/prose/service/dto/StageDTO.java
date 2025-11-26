package com.AL565.prose.service.dto;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StageDTO {

    private Long id;
    private OfferStatus status;
    private EmployeurDTO employeur;
    private String title;
    private String description;
    private String requirements;
    private List<String> skills;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private String workMode;
    private String compensation;
    private String rejectionReason;

    public static Stage toModel(StageDTO dto) {
        return Stage.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .requirements(dto.getRequirements())
                .skills(dto.getSkills())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .location(dto.getLocation())
                .workMode(dto.getWorkMode())
                .compensation(dto.getCompensation())
                .employeurEmail(EmployeurDTO.toModel(dto.getEmployeur()).getEmail())
                .status(OfferStatus.SOUMISE)
                .rejectionReason(dto.getRejectionReason())
                .build();
    }

    public static StageDTO toDTO(Stage offer, Employeur employeur) {
        return StageDTO.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .description(offer.getDescription())
                .requirements(offer.getRequirements())
                .skills(offer.getSkills())
                .startDate(offer.getStartDate())
                .endDate(offer.getEndDate())
                .location(offer.getLocation())
                .workMode(offer.getWorkMode())
                .compensation(offer.getCompensation())
                .status(offer.getStatus())
                .employeur(EmployeurDTO.toDTOTokenless(employeur))
                .rejectionReason(offer.getRejectionReason())
                .build();
    }
}
