package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.EtudiantOffreDecisionNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EtudiantOffreDecisionNotificationRepository extends JpaRepository<EtudiantOffreDecisionNotification, Long> {
    List<EtudiantOffreDecisionNotification> findByTargetEmailAndFirstRecipientReadAtIsNull(String email);
}

