package com.AL565.prose.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProfesseurAssociationDTO {
    private String etudiantEmail;
    private String professeurEmail;
}
