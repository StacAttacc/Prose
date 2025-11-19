package com.AL565.prose.model;

import com.AL565.prose.model.auth.Credentials;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Etudiant extends ProseUser {
    @Enumerated(EnumType.STRING)
    private Discipline discipline;

    @ManyToOne
    @JoinColumn(name = "professeur_id")
    Professeur professeurResponsable;

    public Etudiant(String firstName, String lastName, Credentials credentials, Discipline discipline) {
        super(firstName, lastName, credentials);
        this.discipline = discipline;
    }
}