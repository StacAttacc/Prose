package com.AL565.prose.service.dto;

import com.AL565.prose.model.Gestionnaire;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GestionnairePasswordDTO extends ProseUserDTO {
    private String password;

    public static Gestionnaire toModel(GestionnairePasswordDTO dto) {
        Credentials credentials = Credentials.builder()
                .username(dto.getEmail())
                .password(dto.getPassword())
                .role(Role.GESTIONNAIRE)
                .build();

        return new Gestionnaire(dto.getFirstName(), dto.getLastName(), credentials);
    }
}