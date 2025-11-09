package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.EmployeurResponseNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EmployeurResponseNotificationRepository extends JpaRepository<EmployeurResponseNotification, Long> {
    List<EmployeurResponseNotification> findByEmployeurResponseEmailAndFirstRecipientReadAt(String email, LocalDateTime readAt);
}

