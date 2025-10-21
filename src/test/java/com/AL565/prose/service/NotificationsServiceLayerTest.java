package com.AL565.prose.service;

import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.PostulationNotification;
import com.AL565.prose.model.notifications.StageNotification;
import com.AL565.prose.repository.NotificationRepository;
import com.AL565.prose.repository.PostulationNotificationRepository;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationsServiceLayerTest {
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private PostulationNotificationRepository postulationNotificationRepository;
    @Mock
    private NotificationsHelper notificationsHelper;

    @InjectMocks
    private GestionnaireService gestionnaireService;

    @BeforeEach
    void setUpNotificationsHelper() {
        ReflectionTestUtils.setField(gestionnaireService, "notificationsHelper", new NotificationsHelper(notificationRepository));
    }

    @Test
    @DisplayName("getStageNotifications() returns stage notifications from repository")
    void getNotifications_returnsStageNotifications() throws Exception {
        StageNotification n1 = new StageNotification();
        n1.setType(NotificationType.STAGE_NOTIFICATION);
        n1.setMessage("Stage submitted");
        n1.setCreatedAt(LocalDateTime.now());

        StageNotification n2 = new StageNotification();
        n2.setType(NotificationType.STAGE_NOTIFICATION);
        n2.setMessage("Stage updated");
        n2.setCreatedAt(LocalDateTime.now());

        PostulationNotification n3 = new PostulationNotification();
        n3.setType(NotificationType.POSTULATION_NOTIFICATION);
        n3.setMessage("New application");
        n3.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAt(NotificationType.STAGE_NOTIFICATION, null))
                .thenReturn(List.of(n1, n2));

        when(postulationNotificationRepository.findBySecondRecipientReadAt(null))
                .thenReturn(List.of(n3));

        NotificationsResponseDTO result = gestionnaireService.getGestionnaireNotifications();

        assertThat(result).isNotNull();
        assertThat(result.getTotalCount()).isEqualTo(3);
        assertThat(result.getGroups()).hasSize(2);
        assertThat(result.getGroups().get(0).getItems()).hasSize(2);
        assertThat(result.getGroups().get(0).getItems().get(0).getMessage()).isEqualTo("Stage submitted");
        assertThat(result.getGroups().get(1).getItems().get(0).getMessage()).isEqualTo("New application");

        verify(notificationRepository, times(1))
                .findNotificationsByTypeAndFirstRecipientReadAt(NotificationType.STAGE_NOTIFICATION, null);
    }

    @Test
    @DisplayName("getNotifications() wraps repository failures into NotificationFetchException")
    void getNotifications_wrapsIntoNotificationFetchException() {
        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAt(any(), any()))
                .thenThrow(new RuntimeException("DB down"));

        assertThatThrownBy(() -> gestionnaireService.getGestionnaireNotifications())
                .isInstanceOf(NotificationExceptions.NotificationFetchException.class);

        verify(notificationRepository, times(1))
                .findNotificationsByTypeAndFirstRecipientReadAt(NotificationType.STAGE_NOTIFICATION, null);
    }

    @Test
    @DisplayName("markPostulationAsReadBySecondRecipient() sets secondRecipientReadAt and saves")
    void markPostulationAsReadBySecondRecipient_setsReadAtAndSaves() throws Exception {
        PostulationNotification notification = new PostulationNotification();
        notification.setId(1L);

        when(postulationNotificationRepository.findById(1L)).thenReturn(java.util.Optional.of(notification));

        gestionnaireService.markPostulationAsReadBySecondRecipient(1L);

        assertThat(notification.getSecondRecipientReadAt()).isNotNull();
        verify(postulationNotificationRepository, times(1)).findById(1L);
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    @DisplayName("markPostulationAsReadBySecondRecipient() throws NotificationFetchException when not found")
    void markPostulationAsReadBySecondRecipient_notFound_throws() {
        when(postulationNotificationRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.markPostulationAsReadBySecondRecipient(1L))
                .isInstanceOf(NotificationExceptions.NotificationFetchException.class);

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("markPostulationAsReadBySecondRecipient() wraps save failures into NotificationFetchException")
    void markPostulationAsReadBySecondRecipient_saveThrows_wrapsException() {
        PostulationNotification notification = new PostulationNotification();
        notification.setId(1L);

        when(postulationNotificationRepository.findById(1L)).thenReturn(java.util.Optional.of(notification));
        doThrow(new RuntimeException("DB error")).when(notificationRepository).save(any());

        assertThatThrownBy(() -> gestionnaireService.markPostulationAsReadBySecondRecipient(1L))
                .isInstanceOf(NotificationExceptions.NotificationFetchException.class);

        verify(postulationNotificationRepository, times(1)).findById(1L);
        verify(notificationRepository, times(1)).save(any());
    }
}