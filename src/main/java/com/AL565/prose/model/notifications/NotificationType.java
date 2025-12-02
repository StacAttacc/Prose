package com.AL565.prose.model.notifications;

import lombok.Getter;

@Getter
public enum NotificationType {
    CREATION_STAGE_NOTIFICATION("creation_stage"),
    DEMANDE_APPROBATION_STAGE_NOTIFICATION("demande_approbation_stage"),
    NEW_CV_NOTIFICATION("new_cv"),
    CV_DECISION_NOTIFICATION("cv_decision"),
    POSTULATION_NOTIFICATION("postulation"),
    CANDIDATURE_DECISION_NOTIFICATION("candidature_decision"),
    CONVOCATION_NOTIFICATION("convocation"),
    ETUDIANT_OFFRE_DECISION_NOTIFICATION("etudiant_offre_decision"),
    SIGNATURE_ENTENTE_NOTIFICATION("signature_entente"),
    GESTIONNAIRE_ENTENTE_NOTIFICATION("gestionnaire_entente"),
    ASSIGNATION_NOTIFICATION("assignation");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }
}
