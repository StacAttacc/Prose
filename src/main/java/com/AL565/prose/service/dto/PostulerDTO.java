package com.AL565.prose.service.dto;

import java.time.LocalDateTime;
import java.util.Base64;

import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Postuler;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostulerDTO {
    private Long id;

    @NotNull
    private EtudiantDTO etudiant;
    @NotNull
    private StageDTO stage;
    @NotNull
    private EtudiantCvDTO cv;
    private String motivationLetter;
    private LocalDateTime datePostulation;
    private OfferStatus status;

    @Size(max = 500, message = "Le commentaire ne doit pas dépasser 500 caractères")
    private String comment;

    private LocalDateTime dateDecision;
    private String decision;

    public static Postuler toModel(PostulerDTO dto) {
        return Postuler.builder()
                .etudiant(EtudiantDTO.toModel(dto.getEtudiant()))
                .cv(EtudiantCvDTO.fromDTO(dto.getCv()))
                .stage(StageDTO.toModel(dto.getStage()))
                .motivationLetter(dto.getMotivationLetter() != null ? 
                    Base64.getDecoder().decode(dto.getMotivationLetter()) : null)
                .datePostulation(dto.getDatePostulation() != null ? dto.getDatePostulation() : LocalDateTime.now())
                .status(dto.getStatus() != null ? dto.getStatus() : OfferStatus.SOUMISE)
                .comment(dto.getComment())
                .dateDecision(dto.getDateDecision())
                .decision(dto.getDecision())
                .build();
    }
}
