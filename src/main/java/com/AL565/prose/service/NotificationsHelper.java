package com.AL565.prose.service;

import com.AL565.prose.model.notifications.Notification;
import com.AL565.prose.repository.NotificationRepository;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
public class NotificationsHelper {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void markNotificationAsReadByFirstRecipient(Long notificationId) throws Exception {
        try {
            Notification notification = notificationRepository.findById(notificationId)
                    .orElseThrow(NotificationExceptions.NotificationFetchException::new);
            notification.setFirstRecipientReadAt(OffsetDateTime.now().toLocalDateTime());
            notificationRepository.save(notification);
        } catch (Exception e) {
            throw new NotificationExceptions.NotificationFetchException();
        }
    }
}
