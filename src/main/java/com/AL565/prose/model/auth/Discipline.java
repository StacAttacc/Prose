package com.AL565.prose.model.auth;

public enum Discipline {
    INFORMATIQUE("Informatique"),
    INFIRMIER("Infirmier"),
    GENIE_CIVIL("Génie Civil"),
    COMPTABILITE("Comptabilité"),
    MARKETING("Marketing"),
    MECANIQUE("Mécanique"),
    AUTRE("Autre");

    private final String displayName;

    Discipline(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}