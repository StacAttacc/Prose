package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.SignatureEntenteNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SignatureEntenteNotificationRepository extends JpaRepository<SignatureEntenteNotification, Long> {
    List<SignatureEntenteNotification> findSignatureEntenteNotificationsByFirstRecipientReadAtAndSignatureEntenteEmployeurEmail(LocalDateTime firstRecipientReadAt, String employeurEmail);
    List<SignatureEntenteNotification> findSignatureEntenteNotificationsBySecondRecipientReadAtAndSignatureEntenteEtudiantEmail(LocalDateTime secondRecipientReadAt, String etudiantEmail);
}
