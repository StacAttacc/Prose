package com.AL565.prose.model;

import com.AL565.prose.model.auth.Credentials;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class Professeur extends ProseUser {
    private Discipline discipline;

    public Professeur(String firstName, String lastName, String username, String password, Discipline discipline) {
        super(firstName, lastName, Credentials.builder().username(username).password(password).build());
        this.discipline = discipline;
    }
}
