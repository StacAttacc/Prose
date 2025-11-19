package com.AL565.prose.model.notifications;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.*;

@Entity
@Getter
@Setter
@DiscriminatorValue("cv")
@NoArgsConstructor
@AllArgsConstructor
public class CvNotification extends Notification {
    private Long cvId;
    private String targetEmail;
}
