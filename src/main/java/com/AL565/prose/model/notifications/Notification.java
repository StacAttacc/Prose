package com.AL565.prose.model.notifications;


import com.AL565.prose.model.ProseUser;
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
    private ProseUser recipient;
    private ProseUser sender;
    private String message;
    private NotificationType type;
}
