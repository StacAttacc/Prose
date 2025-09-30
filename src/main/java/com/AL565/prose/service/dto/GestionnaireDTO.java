package com.AL565.prose.service.dto;

import com.AL565.prose.model.Gestionnaire;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import lombok.Data;
import org.springframework.security.crypto.password.PasswordEncoder;

@Data
public class GestionnaireDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password;

    public Gestionnaire toModel(PasswordEncoder passwordEncoder) {
        Credentials credentials = Credentials.builder()
                .username(this.email)
                .password(passwordEncoder.encode(this.password))
                .role(Role.GESTIONNAIRE)
                .build();

        return new Gestionnaire(this.firstName, this.lastName, credentials);
    }
}
