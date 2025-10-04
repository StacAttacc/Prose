package com.AL565.prose.service.dto;

import com.AL565.prose.model.Gestionnaire;
import com.AL565.prose.model.auth.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GestionnaireDTO extends ProseUserDTO {

    public GestionnaireDTO(Gestionnaire model, String token) {
        super(
                model.getId(),
                model.getFirstName(),
                model.getLastName(),
                model.getEmail(),
                model.getRole() != null ? model.getRole() : Role.GESTIONNAIRE,
                token
        );
    }

    public static GestionnaireDTO toDTO(Gestionnaire model, String token) {
        return new GestionnaireDTO(model, token);
    }
}
