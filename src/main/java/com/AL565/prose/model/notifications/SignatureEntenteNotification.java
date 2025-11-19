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
    private Long candidatureId;
    private String targetEmployeurEmail;
    private String targetEtudiantEmail;
    private LocalDateTime thirdRecipientReadAt;
    private Long stageId;
}
