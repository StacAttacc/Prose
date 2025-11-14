package com.AL565.prose.model.notifications;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorColumn(name = "notification_type")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
public abstract class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime firstRecipientReadAt;
    private LocalDateTime secondRecipientReadAt;
    private LocalDateTime createdAt;
    private String messageFR;
    private String messageEN;
    private NotificationType type;
}
