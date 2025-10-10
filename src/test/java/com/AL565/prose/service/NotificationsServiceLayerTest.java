// Java
package com.AL565.prose.service;

import com.AL565.prose.model.notifications.Notification;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.StageNotification;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.GestionnaireRepository;
import com.AL565.prose.repository.NotificationRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.security.exceptions.NotificationExceptions.NotificationFetchException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationsServiceLayerTest {

    @Mock
    private CvRepository cvRepository;

    @Mock
    private GestionnaireRepository gestionnaireRepository;

    @Mock
    private StageRepository stageRepository;

    @Mock
    private EmployeurRepository employeurRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private GestionnaireService gestionnaireService;

    @Test
    @DisplayName("getNotifications() returns stage notifications from repository")
    void getNotifications_returnsStageNotifications() throws Exception {
        StageNotification n1 = new StageNotification();
        n1.setType(NotificationType.STAGE_NOTIFICATION);
        n1.setMessage("Stage submitted");
        n1.setCreatedAt(LocalDateTime.now());

        StageNotification n2 = new StageNotification();
        n2.setType(NotificationType.STAGE_NOTIFICATION);
        n2.setMessage("Stage updated");
        n2.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.findNotificationsByType(NotificationType.STAGE_NOTIFICATION))
                .thenReturn(List.of(n1, n2));

        List<Notification> result = gestionnaireService.getNotifications();

        assertThat(result).hasSize(2);
        assertThat(result.getFirst()).isInstanceOf(StageNotification.class);
        assertThat(result.getFirst().getType()).isEqualTo(NotificationType.STAGE_NOTIFICATION);
        assertThat(result.getFirst().getMessage()).isEqualTo("Stage submitted");

        verify(notificationRepository, times(1))
                .findNotificationsByType(NotificationType.STAGE_NOTIFICATION);
        verifyNoMoreInteractions(notificationRepository);
    }

    @Test
    @DisplayName("getNotifications() wraps repository failures into NotificationFetchException")
    void getNotifications_wrapsIntoNotificationFetchException() {
        when(notificationRepository.findNotificationsByType(any()))
                .thenThrow(new RuntimeException("DB down"));

        assertThatThrownBy(() -> gestionnaireService.getNotifications())
                .isInstanceOf(NotificationFetchException.class);

        verify(notificationRepository, times(1))
                .findNotificationsByType(NotificationType.STAGE_NOTIFICATION);
    }
}