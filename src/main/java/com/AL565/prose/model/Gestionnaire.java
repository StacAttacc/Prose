package com.AL565.prose.model;

import com.AL565.prose.model.auth.Credentials;
import jakarta.persistence.Entity;
import lombok.*;

@Getter @Setter
@Entity
@Builder
public class Gestionnaire extends ProseUser {

    public Gestionnaire() {
        super();
    }

    public Gestionnaire(String firstName, String lastName, Credentials credentials) {
        super(firstName, lastName, credentials);
    }
}