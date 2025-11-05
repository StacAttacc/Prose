package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.PostulationNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PostulationNotificationRepository extends JpaRepository<PostulationNotification, Long> {
    List<PostulationNotification> findByFirstRecipientReadAtAndEmployeurEmail(LocalDateTime firstRecipientReadAt, String employeurEmail);
}
