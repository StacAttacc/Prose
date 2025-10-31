package com.AL565.prose.model.notifications;

import com.AL565.prose.model.Stage;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.*;

@Entity
@Getter
@Setter
@DiscriminatorValue("value")
@NoArgsConstructor
@AllArgsConstructor
public class StageNotification extends Notification {
    @OneToOne
    @JoinColumn(name = "stage_id")
    private Stage stage;
}
