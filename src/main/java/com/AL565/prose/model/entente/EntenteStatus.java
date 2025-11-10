package com.AL565.prose.model.entente;

public enum EntenteStatus {
    A_SIGNER("À signer"),
    SIGNEE_ETUDIANT("Signée par l'étudiant"),
    SIGNEE_EMPLOYEUR("Signée par l'employeur"),
    SIGNEE_ETUDIANT_ET_EMPLOYEUR("Signée par l'étudiant et l'employeur"),
    SIGNEE("Signée par toutes les parties"),
    ANNULEE("Annulée");

    private final String description;

    EntenteStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}