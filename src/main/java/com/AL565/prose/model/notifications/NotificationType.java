package com.AL565.prose.model.notifications;

import lombok.Getter;

@Getter
public enum NotificationType {
    STAGE_NOTIFICATION("stage"),
    GESTIONNAIRE_CV_NOTIFICATION("gestionnaire_cv"),
    POSTULATION_NOTIFICATION("postulation");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }
}
