package com.AL565.prose.model.notifications;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;

@Entity
@Getter
@Setter
@DiscriminatorValue("stage")
@NoArgsConstructor
@AllArgsConstructor
public class StageNotification extends Notification {
    private Long stageId;
}
