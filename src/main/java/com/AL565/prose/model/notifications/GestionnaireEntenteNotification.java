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
@DiscriminatorValue("gestionnaire_entente")
@NoArgsConstructor
@AllArgsConstructor
public class GestionnaireEntenteNotification extends Notification {
    private Long candidatureId;
}
