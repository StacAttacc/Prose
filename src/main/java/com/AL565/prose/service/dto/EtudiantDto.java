package com.AL565.prose.service.dto;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import lombok.Data;
import org.springframework.security.crypto.password.PasswordEncoder;

@Data
public class EtudiantDto {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Discipline discipline;

    public Etudiant toModel(PasswordEncoder passwordEncoder) {
        Credentials credentials = Credentials.builder()
                .username(this.email)
                .password(passwordEncoder.encode(this.password))
                .role(Role.ETUDIANT)
                .build();

        return new Etudiant(this.firstName, this.lastName, credentials, this.discipline);
    }
}