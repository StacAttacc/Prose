package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.SignatureEntenteNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SignatureEntenteNotificationRepository extends JpaRepository<SignatureEntenteNotification, Long> {
    List<SignatureEntenteNotification> findSignatureEntenteNotificationsByTypeAndSecondRecipientReadAtIsNullAndTargetEtudiantEmail(
            NotificationType type,
            String targetEtudiantEmail
    );
    List<SignatureEntenteNotification> findSignatureEntenteNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmployeurEmail(
            NotificationType type,
            String targetEtudiantEmail
    );
}
