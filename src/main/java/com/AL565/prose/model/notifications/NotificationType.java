package com.AL565.prose.model.notifications;

import lombok.Getter;

@Getter
public enum NotificationType {
    STAGE_NOTIFICATION("stage"),
    CV_NOTIFICATION("cv"),
    MESSAGE_NOTIFICATION("message"),
    POSTULATION_NOTIFICATION("postulation");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }
}
