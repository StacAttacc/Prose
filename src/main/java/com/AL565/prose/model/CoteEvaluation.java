package com.AL565.prose.model;

import lombok.Getter;

@Getter
public enum CoteEvaluation {
    TOTALEMENT_EN_ACCORD("Totalement en accord"),
    PLUTOT_EN_ACCORD("Plutot en accord"),
    PLUTOT_DESACCORD("Plutot désaccord"),
    TOTALEMENT_DESACCORD("Totalement en désaccord"),
    IMPOSIBLE_PRONONCER("Impossible de se prononcer");

    private String description;

    CoteEvaluation(String description) {
        this.description = description;
    }

    public static CoteEvaluation getByDescription(String status) {
        for (CoteEvaluation cote : CoteEvaluation.values()) {
            if (cote.getDescription().equalsIgnoreCase(status)) {
                return cote;
            }
        }
        throw new IllegalArgumentException("Impossible to find " + status);
    }

}
