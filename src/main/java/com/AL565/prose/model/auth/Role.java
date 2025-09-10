package com.AL565.prose.model.auth;

import java.util.HashSet;
import java.util.Set;

public enum Role {
    GESTIONNAIRE("ROLE_GESTIONNAIRE"),
    PROFESSEUR("ROLE_PROFESSEUR"),
    EMPLOYEUR("ROLE_EMPLOYEUR"),
    ETUDIANT("ROLE_ETUDIANT"),
    ;

    private final String string;
    private final Set<Role> managedRoles = new HashSet<>();

    static{
        GESTIONNAIRE.managedRoles.add(ETUDIANT);
        PROFESSEUR.managedRoles.add(ETUDIANT);
    }

    Role(String string){
        this.string = string;
    }

    @Override
    public String toString(){
        return string;
    }
}
