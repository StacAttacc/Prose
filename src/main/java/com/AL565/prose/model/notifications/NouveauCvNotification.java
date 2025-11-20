package com.AL565.prose.model.notifications;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;

@Entity
@Getter
@Setter
@DiscriminatorValue("cv_decision")
@NoArgsConstructor
@AllArgsConstructor
public class NouveauCvNotification extends Notification {
    private Long cvId;
}
