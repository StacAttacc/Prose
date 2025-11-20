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
@DiscriminatorValue("convocation")
@NoArgsConstructor
@AllArgsConstructor
public class ConvocationNotification extends Notification {
    private Long candidatureId;
    private Long etudiantId;
}
