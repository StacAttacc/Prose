package com.AL565.prose.model.notifications;

import lombok.Getter;

@Getter
public enum NotificationType {
    STAGE_NOTIFICATION("stage"),
    GESTIONNAIRE_CV_NOTIFICATION("gestionnaire_cv"),
    ETUDIANT_CV_NOTIFICATION("etudiant_cv"),
    POSTULATION_NOTIFICATION("postulation"),
    CANDIDATURE_DECISION_NOTIFICATION("candidature_decision"),
    CONVOCATION_NOTIFICATION("convocation");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }
}
