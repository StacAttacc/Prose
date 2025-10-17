package com.AL565.prose.service;

import com.AL565.prose.model.notifications.Notification;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.StageNotification;
import com.AL565.prose.repository.NotificationRepository;
import com.AL565.prose.security.exceptions.NotificationExceptions.NotificationFetchException;
import com.AL565.prose.service.dto.StageNotificationDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationsServiceLayerTest {
    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private GestionnaireService gestionnaireService;

    @Test
    @DisplayName("getNotifications() returns stage notifications from repository")
    void getStageNotifications_returnsStageNotifications() throws Exception {
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

        StageNotificationDTO result = gestionnaireService.getStageNotifications();

        assertThat(result.getStageNotifications()).hasSize(2);
        assertThat(result.getStageNotifications().getFirst()).isInstanceOf(StageNotification.class);
        assertThat(result.getStageNotifications().getFirst().getType()).isEqualTo(NotificationType.STAGE_NOTIFICATION);
        assertThat(result.getStageNotifications().getFirst().getMessage()).isEqualTo("Stage submitted");

        verify(notificationRepository, times(1))
                .findNotificationsByType(NotificationType.STAGE_NOTIFICATION);
        verifyNoMoreInteractions(notificationRepository);
    }

    @Test
    @DisplayName("getNotifications() wraps repository failures into NotificationFetchException")
    void getNotifications_wrapsIntoNotificationFetchException() {
        when(notificationRepository.findNotificationsByType(any()))
                .thenThrow(new RuntimeException("DB down"));

        assertThatThrownBy(() -> gestionnaireService.getStageNotifications())
                .isInstanceOf(NotificationFetchException.class);

        verify(notificationRepository, times(1))
                .findNotificationsByType(NotificationType.STAGE_NOTIFICATION);
    }

    @Test
    void markNotificationAsRead_success() throws Exception {
        Notification notification = new StageNotification();
        notification.setId(1L);
        notification.setReadAt(null);

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        gestionnaireService.markNotificationAsRead(1L);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertThat(captor.getValue().getReadAt()).isNotNull();
    }

    @Test
    void markNotificationAsRead_notFound_throwsNotificationFetchException() {
        when(notificationRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.markNotificationAsRead(1L))
                .isInstanceOf(NotificationFetchException.class);

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markNotificationAsRead_saveThrows_wrappsToNotificationFetchException() {
        Notification notification = new StageNotification();
        notification.setId(1L);

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        doThrow(new RuntimeException("DB")).when(notificationRepository).save(any(Notification.class));

        assertThatThrownBy(() -> gestionnaireService.markNotificationAsRead(1L))
                .isInstanceOf(NotificationFetchException.class);
    }
}