package com.AL565.prose.model.notifications;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class Notification {
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private String senderEmail;
    private String message;
    private NotificationType type;
}
