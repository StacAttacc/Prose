package com.AL565.prose.model.notifications;

import lombok.Getter;

@Getter
public enum NotificationType {
    STAGE_NOTIFICATION("stage"),
    NEW_CV_NOTIFICATION("new_cv"),
    CV_DECISION_NOTIFICATION("cv_decision"),
    POSTULATION_NOTIFICATION("postulation"),
    CANDIDATURE_DECISION_NOTIFICATION("candidature_decision"),
    CONVOCATION_NOTIFICATION("convocation"),
    ETUDIANT_OFFRE_DECISION_NOTIFICATION("etudiant_offre_decision"),
    SIGNATURE_ENTENTE_NOTIFICATION("signature_entente");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }
}
