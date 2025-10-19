package com.AL565.prose.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class EtudiantCandidaturesDTO {
    private EtudiantDTO etudiant;
    private List<EtudiantCandidatureDTO> candidatures;
}
