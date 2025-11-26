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
@DiscriminatorValue("assignation")
@NoArgsConstructor
@AllArgsConstructor
public class AssignationNotification  extends Notification {
    private Long candidatureId;
    private Long etudiantId;
}