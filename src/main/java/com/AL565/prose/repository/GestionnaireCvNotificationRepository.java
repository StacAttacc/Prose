package com.AL565.prose.repository;

import com.AL565.prose.model.notifications.GestionnaireCvNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GestionnaireCvNotificationRepository extends JpaRepository<GestionnaireCvNotification,Long> {
    Optional<GestionnaireCvNotification> findByCv_Id(Long cvId);
}
