package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.Notification;
import com.AL565.prose.model.notifications.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findNotificationsByTypeAndFirstRecipientReadAtIsNull(NotificationType type);
    List<Notification> findNotificationsByTypeAndSecondRecipientReadAtIsNull(NotificationType type);
    List<Notification> findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(NotificationType type, String targetEmail);
    List<Notification> findNotificationsByTypeAndSecondRecipientReadAtIsNullAndTargetEmail(NotificationType type, String targetEmail);

}
