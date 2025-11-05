package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.EtudiantCvNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EtudiantCvNotificationRepository extends JpaRepository<EtudiantCvNotification, Long> {
    List<EtudiantCvNotification> findEtudiantCvNotificationsByFirstRecipientReadAtAndEtudiantEmail(
            LocalDateTime readAt,
            String etudiantEmail);
}
