package com.AL565.prose.service.dto;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.AL565.prose.model.Gestionnaire;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GestionnaireDTO extends ProseUserDTO {
    private String password;

    public static Gestionnaire toModel(GestionnaireDTO gestionnaireDTO, PasswordEncoder passwordEncoder) {
        Credentials credentials = Credentials.builder()
                .username(gestionnaireDTO.getEmail())
                .password(passwordEncoder.encode(gestionnaireDTO.getPassword()))
                .role(Role.GESTIONNAIRE)
                .build();

        return new Gestionnaire(gestionnaireDTO.getFirstName(), gestionnaireDTO.getLastName(), credentials);
    }

    public GestionnaireDTO(Gestionnaire gestionnaire, String token) {
        super(gestionnaire.getId(), gestionnaire.getFirstName(), gestionnaire.getLastName(), gestionnaire.getEmail(), gestionnaire.getRole(), token);
    }

    public static GestionnaireDTO toDTO(Gestionnaire gestionnaire, String token) {
        return new GestionnaireDTO(gestionnaire, token);
    }

    public GestionnaireDTO() {
        //TODO Auto-generated constructor stub
    }
}
