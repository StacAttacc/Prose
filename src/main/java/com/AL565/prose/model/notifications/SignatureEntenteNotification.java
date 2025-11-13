package com.AL565.prose.model.notifications;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@DiscriminatorValue("signature_entente")
@NoArgsConstructor
@AllArgsConstructor
public class SignatureEntenteNotification extends Notification {
    private Long signatureEntenteId;
    private String signatureEntenteEmployeurEmail;
    private String signatureEntenteEtudiantEmail;
    private LocalDateTime gestionnaireReadAt;
}
