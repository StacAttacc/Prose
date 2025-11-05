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
@DiscriminatorValue("postulation")
@NoArgsConstructor
@AllArgsConstructor
public class PostulationNotification extends Notification {
    private Long candidaturePostulationId;
    private Long etudiantPostulationId;
    private Long stagePostulationId;
    private String employeurEmail;
}
