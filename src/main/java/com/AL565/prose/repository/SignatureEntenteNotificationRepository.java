package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.SignatureEntenteNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SignatureEntenteNotificationRepository extends JpaRepository<SignatureEntenteNotification, Long> {
    List<SignatureEntenteNotification> findByThirdRecipientReadAtIsNullAndFirstRecipientReadAtIsNotNullAndSecondRecipientReadAtIsNotNull();
    java.util.Optional<SignatureEntenteNotification> findByCandidatureId(Long candidatureId);
    java.util.Optional<SignatureEntenteNotification> findByStageId(Long stageId);
}
