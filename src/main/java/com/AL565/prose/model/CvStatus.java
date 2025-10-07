package com.AL565.prose.model;

import lombok.Getter;

@Getter
public enum CvStatus {
    PENDING("Pending"),
    APPROVED("Approved"),
    REJECTED("Rejected");

    private final String displayName;

    CvStatus(String displayName) {
        this.displayName = displayName;
    }

}
