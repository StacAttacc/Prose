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
@DiscriminatorValue("etudiant_offre_decision")
@NoArgsConstructor
@AllArgsConstructor
public class EtudiantOffreDecisionNotification extends Notification {
    private Long candidatureResponseId;
    private Long etudiantResponseId;
    private Long stageResponseId;
    private String employeurResponseEmail;
    private boolean isOffreAcceptedByStudent;
}
