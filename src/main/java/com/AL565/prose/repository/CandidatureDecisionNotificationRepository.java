package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.CandidatureDecisionNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CandidatureDecisionNotificationRepository extends JpaRepository<CandidatureDecisionNotification, Long> {
    List<CandidatureDecisionNotification> findCandidatureDecisionNotificationsByFirstRecipientReadAtAndCandidatureDecisionEtudiantEmail(LocalDateTime firstRecipientReadAt, String candidatureDecisionEtudiantEmail);
}
