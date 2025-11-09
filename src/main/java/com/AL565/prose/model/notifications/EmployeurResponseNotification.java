package com.AL565.prose.model.notifications;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@DiscriminatorValue("employeur_response")
@NoArgsConstructor
@AllArgsConstructor
public class EmployeurResponseNotification extends Notification {
    private Long candidatureResponseId;
    private Long etudiantResponseId;
    private Long stageResponseId;
    private String employeurResponseEmail;
    private boolean accepted;
    private String comment;
}

