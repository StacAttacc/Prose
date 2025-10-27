package com.AL565.prose.model;

import lombok.Getter;

@Getter
public enum CandidatureStatus {
    SOUMISE("Soumise"),
    ACCEPTEE("Acceptee"),
    CONVOQUEE("Convoquee"),
    REFUSEE("Refusee");

    private final String description;

    CandidatureStatus(String description) {
        this.description = description;
    }

    public static CandidatureStatus getByDescription(String status) {
        for (CandidatureStatus candidatureStatus : CandidatureStatus.values()) {
            if (candidatureStatus.getDescription().equalsIgnoreCase(status)) {
                return candidatureStatus;
            }
        }
        throw new IllegalArgumentException("Impossible to find " + status);
    }
}
