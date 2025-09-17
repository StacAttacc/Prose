package com.AL565.prose.model.auth;

import com.AL565.prose.model.ProseUser;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Etudiant extends ProseUser {

    @Enumerated(EnumType.STRING)
    private Discipline discipline;
}