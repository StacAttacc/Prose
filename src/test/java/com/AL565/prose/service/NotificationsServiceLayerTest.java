package com.AL565.prose.service;

import com.AL565.prose.model.notifications.NotificationType;
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
    void getStageNotifications_returnsStageNotifications() throws Exception {
        StageNotification n1 = new StageNotification();
        n1.setType(NotificationType.STAGE_NOTIFICATION);
        n1.setMessage("Stage submitted");
        n1.setCreatedAt(LocalDateTime.now());

        StageNotification n2 = new StageNotification();
        n2.setType(NotificationType.STAGE_NOTIFICATION);
        n2.setMessage("Stage updated");
        n2.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.findNotificationsByTypeAndReadAt(NotificationType.STAGE_NOTIFICATION, null))
                .thenReturn(List.of(n1, n2));

        NotificationsResponseDTO result = gestionnaireService.getStageNotifications();

        assertThat(result).isNotNull();
        assertThat(result.getTotalCount()).isEqualTo(2);
        assertThat(result.getGroups()).hasSize(1);
        assertThat(result.getGroups().get(0).getItems()).hasSize(2);
        assertThat(result.getGroups().get(0).getItems().get(0).getMessage()).isEqualTo("Stage submitted");

        verify(notificationRepository, times(1))
                .findNotificationsByTypeAndReadAt(NotificationType.STAGE_NOTIFICATION, null);
    }

    @Test
    @DisplayName("getNotifications() wraps repository failures into NotificationFetchException")
    void getNotifications_wrapsIntoNotificationFetchException() {
        when(notificationRepository.findNotificationsByTypeAndReadAt(any(), any()))
                .thenThrow(new RuntimeException("DB down"));

        assertThatThrownBy(() -> gestionnaireService.getStageNotifications())
                .isInstanceOf(NotificationExceptions.NotificationFetchException.class);

        verify(notificationRepository, times(1))
                .findNotificationsByTypeAndReadAt(NotificationType.STAGE_NOTIFICATION, null);
    }
}