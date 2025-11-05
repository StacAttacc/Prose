package com.AL565.prose.service.dto;

import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.model.Employeur;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Base64;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntenteDTO {
    private Long id;
    private Long candidatureId;
    private EntenteStatus status;
    private LocalDateTime dateCreation;
    private LocalDateTime dateSignatureEtudiant;
    private LocalDateTime dateSignatureEmployeur;
    private LocalDateTime dateSignatureComplete;
    
    private EtudiantDTO etudiant;
    private EmployeurDTO employeur;
    private StageDTO stage;
    
    private String documentPdfBase64;
    private String documentName;

    public static EntenteDTO toDTO(Entente entente, Employeur employeur) {
        if (entente == null) return null;

        EntenteDTO dto = EntenteDTO.builder()
                .id(entente.getId())
                .candidatureId(entente.getCandidature().getId())
                .status(entente.getStatus())
                .dateCreation(entente.getDateCreation())
                .dateSignatureEtudiant(entente.getDateSignatureEtudiant())
                .dateSignatureEmployeur(entente.getDateSignatureEmployeur())
                .dateSignatureComplete(entente.getDateSignatureComplete())
                .documentName(entente.getDocumentName())
                .build();

        if (entente.getDocumentPdf() != null) {
            dto.setDocumentPdfBase64(Base64.getEncoder().encodeToString(entente.getDocumentPdf()));
        }

        if (entente.getCandidature() != null) {
            var candidature = entente.getCandidature();
            if (candidature.getEtudiant() != null) {
                dto.setEtudiant(EtudiantDTO.toDTOTokenless(candidature.getEtudiant()));
            }
            if (candidature.getStage() != null) {
                dto.setStage(StageDTO.fromModel(candidature.getStage(), employeur));
            }
        }

        return dto;
    }
}
