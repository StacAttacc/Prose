package com.AL565.prose.service;

import com.AL565.prose.model.CV;
import com.AL565.prose.model.CvStatus;
import com.AL565.prose.model.notifications.*;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private EtudiantCvNotificationRepository etudiantCvNotificationRepository;
    @Mock
    private EtudiantRepository etudiantRepository;
    @Mock
    private ProseUserRepository proseUserRepository;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private CvRepository cvRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private StageRepository stageRepository;
    @Mock
    private EmployeurRepository employeurRepository;
    @Mock
    private CandidatureRepository candidatureRepository;
    @Mock
    private GestionnaireCvNotificationRepository gestionnaireCvNotificationRepository;
    @Mock
    private NotificationsHelper notificationsHelper;

    @InjectMocks
    private GestionnaireService gestionnaireService;
    @InjectMocks
    private EtudiantService etudiantService;

    @BeforeEach
    void setUpNotificationsHelper() {
        ReflectionTestUtils.setField(gestionnaireService, "notificationsHelper", new NotificationsHelper(notificationRepository));
    }

    @Test
    @DisplayName("getStageNotifications() returns stage notifications from repository")
    void getNotifications_returnsNotifications() throws Exception {
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

        GestionnaireCvNotification n4 = new GestionnaireCvNotification();
        n4.setType(NotificationType.GESTIONNAIRE_CV_NOTIFICATION);
        n4.setMessage("New CV uploaded");
        n4.setCreatedAt(LocalDateTime.now());

        EtudiantCvNotification n5 = new EtudiantCvNotification();
        n5.setType(NotificationType.ETUDIANT_CV_NOTIFICATION);
        n5.setMessage("CV processed");
        n5.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAt(NotificationType.STAGE_NOTIFICATION, null))
                .thenReturn(List.of(n1, n2));

        when(notificationRepository.findNotificationsByTypeAndSecondRecipientReadAt(NotificationType.POSTULATION_NOTIFICATION, null))
                .thenReturn(List.of(n3));

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAt(NotificationType.GESTIONNAIRE_CV_NOTIFICATION, null))
                .thenReturn(List.of(n4));

        when(etudiantCvNotificationRepository.findNotificationsByTypeAndFirstRecipientReadAtAndEtudiant_Credentials_Username(
                NotificationType.ETUDIANT_CV_NOTIFICATION,
                null,
                "dummy@email.com"
        )).thenReturn(List.of(n5));

        NotificationsResponseDTO gestionnaireResult = gestionnaireService.getGestionnaireNotifications();
        NotificationsResponseDTO etudiantResult = etudiantService.getStudentsNotifications("dummy@email.com");

        assertThat(gestionnaireResult).isNotNull();
        assertThat(gestionnaireResult.getTotalCount()).isEqualTo(4);
        assertThat(gestionnaireResult.getGroups()).hasSize(3);
        assertThat(gestionnaireResult.getGroups().get(0).getItems()).hasSize(2);
        assertThat(gestionnaireResult.getGroups().get(0).getItems().getFirst().getMessage()).isEqualTo("Stage submitted");
        assertThat(gestionnaireResult.getGroups().get(1).getItems().getFirst().getMessage()).isEqualTo("New application");
        assertThat(gestionnaireResult.getGroups().get(2).getItems().getFirst().getMessage()).isEqualTo("New CV uploaded");

        assertThat(etudiantResult).isNotNull();
        assertThat(etudiantResult.getTotalCount()).isEqualTo(1);
        assertThat(etudiantResult.getGroups()).hasSize(1);
        assertThat(etudiantResult.getGroups().getFirst().getItems()).hasSize(1);
        assertThat(etudiantResult.getGroups().getFirst().getItems().getFirst().getMessage()).isEqualTo("CV processed");

        verify(etudiantCvNotificationRepository, times(1))
                .findNotificationsByTypeAndFirstRecipientReadAtAndEtudiant_Credentials_Username(
                        NotificationType.ETUDIANT_CV_NOTIFICATION,
                        null,
                        "dummy@email.com");
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

    @Test
    @DisplayName("markNotificationAsRead() creates student CV notification when gestionnaire notification found")
    void markNotificationAsRead_createsEtudiantCvNotification_whenGestionnaireReadsNotification() throws Exception {
        CV cv = new CV();
        cv.setId(42L);
        cv.setStatus(CvStatus.REJECTED);

        GestionnaireCvNotification gcn = new GestionnaireCvNotification();
        gcn.setId(1L);
        gcn.setType(NotificationType.GESTIONNAIRE_CV_NOTIFICATION);
        gcn.setCv(cv);

        when(notificationRepository.findById(1L)).thenReturn(java.util.Optional.of(gcn));
        when(gestionnaireCvNotificationRepository.findById(1L)).thenReturn(java.util.Optional.of(gcn));

        gestionnaireService.markNotificationAsRead(1L);

        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

}