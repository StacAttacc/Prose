package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.CvNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CvNotificationRepository extends JpaRepository<CvNotification, Long> {
    List<CvNotification> findCvNotificationsByFirstRecipientReadAtIsNotNullAndSecondRecipientReadAtIsNullAndTargetEmail(String targetEmail);
}
