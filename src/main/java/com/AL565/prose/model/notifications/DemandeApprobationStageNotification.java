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
@DiscriminatorValue("demande_approbation_stage")
@NoArgsConstructor
@AllArgsConstructor
public class DemandeApprobationStageNotification extends Notification{
    private Long stageId;
}
