package com.AL565.prose.model;

import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import lombok.*;

import java.util.List;

@Entity
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class Professeur extends ProseUser {
    @Enumerated(EnumType.STRING)
    private Discipline discipline;


    @OneToMany(mappedBy = "professeurResponsable")
    List<Etudiant> etudiants;

    public Professeur(String firstName, String lastName, String username, String password, Discipline discipline) {
        super(firstName, lastName, new Credentials(username, password, Role.PROFESSEUR));
        this.discipline = discipline;
    }
}
