package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
}
