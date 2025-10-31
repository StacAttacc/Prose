package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.ConvocationNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ConvocationNotificationRepository extends JpaRepository<ConvocationNotification, Long> {
    List<ConvocationNotification> findByFirstRecipientReadAtAndEtudiantConvocationEmail(LocalDateTime firstRecipientReadAt, String etudiantEmail);
}
