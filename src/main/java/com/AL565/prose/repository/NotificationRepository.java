package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.Notification;
import com.AL565.prose.model.notifications.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findNotificationsByTypeAndFirstRecipientReadAt(NotificationType type, LocalDateTime readAt);
    List<Notification> findNotificationsByTypeAndSecondRecipientReadAt(NotificationType type, LocalDateTime readAt);
}
