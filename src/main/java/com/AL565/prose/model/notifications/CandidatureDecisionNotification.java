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
@DiscriminatorValue("candidature_decision")
@NoArgsConstructor
@AllArgsConstructor
public class CandidatureDecisionNotification extends Notification {
    private Long candidatureDecisionId;
    private String candidatureDecisionEtudiantEmail;
    private Long candidatureDecisionEtudiantId;
}
