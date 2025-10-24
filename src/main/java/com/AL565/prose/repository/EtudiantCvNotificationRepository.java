package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.EtudiantCvNotification;
import com.AL565.prose.model.notifications.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EtudiantCvNotificationRepository extends JpaRepository<EtudiantCvNotification, Long> {
    List<EtudiantCvNotification> findNotificationsByTypeAndFirstRecipientReadAtAndEtudiant_Credentials_Username(
            NotificationType type,
            LocalDateTime readAt,
            String email);

}
