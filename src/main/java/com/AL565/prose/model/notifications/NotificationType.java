package com.AL565.prose.model.notifications;

import lombok.Getter;

@Getter
public enum NotificationType {
    STAGE_NOTIFICATION("stage"),
    GESTIONNAIRE_CV_NOTIFICATION("gestionnaire_cv"),
    ETUDIANT_CV_NOTIFICATION("etudiant_cv"),
    POSTULATION_NOTIFICATION("postulation"),
    CONVOCATION_NOTIFICATION("convocation"),
    EMPLOYEUR_RESPONSE_NOTIFICATION("employeur_response");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }
}
