package com.AL565.prose.model.notifications;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;

@Entity
@Getter
@Setter
@DiscriminatorValue("creation_stage")
@NoArgsConstructor
@AllArgsConstructor
public class CreationStageNotification extends Notification {
    private Long stageId;
}
