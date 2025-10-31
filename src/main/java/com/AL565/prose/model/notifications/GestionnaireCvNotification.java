package com.AL565.prose.model.notifications;

import com.AL565.prose.model.CV;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.*;

@Entity
@Getter
@Setter
@DiscriminatorValue("gestionnaire_cv")
@NoArgsConstructor
@AllArgsConstructor
public class GestionnaireCvNotification extends Notification {
    @OneToOne
    @JoinColumn(name = "cv_id")
    private CV cv;
}
