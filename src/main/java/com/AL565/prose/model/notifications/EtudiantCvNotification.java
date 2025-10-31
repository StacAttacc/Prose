package com.AL565.prose.model.notifications;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("etudiant_cv")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EtudiantCvNotification extends Notification {
    private String etudiantEmail;
}
