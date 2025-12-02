package com.AL565.prose.service;

import com.AL565.prose.model.notifications.*;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import com.AL565.prose.utils.NotificationsHelper;
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

import static com.AL565.prose.model.notifications.NotificationType.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationsServiceLayerTest {
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private SignatureEntenteNotificationRepository signatureEntenteNotificationRepository;

    @InjectMocks
    private GestionnaireService gestionnaireService;
    @InjectMocks
    private EtudiantService etudiantService;
    @InjectMocks
    private EmployeurService employeurService;

    @BeforeEach
    void setUpNotificationsHelper() {
        ReflectionTestUtils.setField(gestionnaireService, "notificationsHelper", new NotificationsHelper(notificationRepository));
    }

    @Test
    @DisplayName("getStageNotifications() returns stage notifications from repository")
    void getNotifications_returnsNotifications() throws Exception {
        CreationStageNotification n1 = new CreationStageNotification();
        n1.setType(CREATION_STAGE_NOTIFICATION);
        n1.setMessageEN("Stage submitted");
        n1.setCreatedAt(LocalDateTime.now());

        CreationStageNotification n2 = new CreationStageNotification();
        n2.setType(CREATION_STAGE_NOTIFICATION);
        n2.setMessageEN("Stage updated");
        n2.setCreatedAt(LocalDateTime.now());

        PostulationNotification n3 = new PostulationNotification();
        n3.setType(POSTULATION_NOTIFICATION);
        n3.setMessageEN("New application");
        n3.setCreatedAt(LocalDateTime.now());

        NouveauCvNotification n4 = new NouveauCvNotification();
        n4.setType(NEW_CV_NOTIFICATION);
        n4.setMessageEN("New CV uploaded");
        n4.setCreatedAt(LocalDateTime.now());

        NouveauCvNotification n5 = new NouveauCvNotification();
        n5.setType(CV_DECISION_NOTIFICATION);
        n5.setMessageEN("CV processed");
        n5.setCreatedAt(LocalDateTime.now());

        EtudiantOffreDecisionNotification n6 = new EtudiantOffreDecisionNotification();
        n6.setType(ETUDIANT_OFFRE_DECISION_NOTIFICATION);
        n6.setMessageEN("Offer decision made");
        n6.setCreatedAt(LocalDateTime.now());

        ConvocationNotification n7 = new ConvocationNotification();
        n7.setType(CONVOCATION_NOTIFICATION);
        n7.setMessageEN("New convocation");
        n7.setCreatedAt(LocalDateTime.now());

        CandidatureDecisionNotification n8 = new CandidatureDecisionNotification();
        n8.setType(CANDIDATURE_DECISION_NOTIFICATION);
        n8.setMessageEN("Candidature decision made");
        n8.setCreatedAt(LocalDateTime.now());

        SignatureEntenteNotification n9 = new SignatureEntenteNotification();
        n9.setType(SIGNATURE_ENTENTE_NOTIFICATION);
        n9.setMessageEN("Entente needs to be signed");
        n9.setCreatedAt(LocalDateTime.now());

        DemandeApprobationStageNotification n10 = new DemandeApprobationStageNotification();
        n10.setType(DEMANDE_APPROBATION_STAGE_NOTIFICATION);
        n10.setMessageEN("Stage approval request done");
        n10.setCreatedAt(LocalDateTime.now());

        AssignationNotification n11 = new AssignationNotification();
        n11.setType(ASSIGNATION_NOTIFICATION);
        n11.setMessageEN("New assignation");
        n11.setCreatedAt(LocalDateTime.now());

        GestionnaireEntenteNotification n12 = new GestionnaireEntenteNotification();
        n12.setType(GESTIONNAIRE_ENTENTE_NOTIFICATION);
        n12.setMessageEN("Both parties signed entente");
        n12.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAtIsNull(
                GESTIONNAIRE_ENTENTE_NOTIFICATION
        )).thenReturn(List.of(n12));

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                ASSIGNATION_NOTIFICATION,
                "dummy@email.com"
        )).thenReturn(List.of(n11));

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                DEMANDE_APPROBATION_STAGE_NOTIFICATION,
                "dummy@email.com"
        )).thenReturn(List.of(n10));

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAtIsNull(
                CREATION_STAGE_NOTIFICATION
        )).thenReturn(List.of(n1, n2));

        when(notificationRepository.findNotificationsByTypeAndSecondRecipientReadAtIsNull(
                POSTULATION_NOTIFICATION
        )).thenReturn(List.of(n3));

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAtIsNull(
                NEW_CV_NOTIFICATION
        )).thenReturn(List.of(n4));

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                CV_DECISION_NOTIFICATION,
                "dummy@email.com"
        )).thenReturn(List.of(n5));

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                POSTULATION_NOTIFICATION,
                "dummy@email.com"
        )).thenReturn(List.of(n3));

        when(signatureEntenteNotificationRepository.findSignatureEntenteNotificationsByTypeAndSecondRecipientReadAtIsNullAndTargetEtudiantEmail(
                SIGNATURE_ENTENTE_NOTIFICATION,
                "dummy@email.com"
        )).thenReturn(List.of(n9));

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                ETUDIANT_OFFRE_DECISION_NOTIFICATION,
                "dummy@email.com"
        )).thenReturn(List.of(n6));

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                CONVOCATION_NOTIFICATION,
                "dummy@email.com"
        )).thenReturn(List.of(n7));

        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                CANDIDATURE_DECISION_NOTIFICATION,
                "dummy@email.com"
        )).thenReturn(List.of(n8));

        when(signatureEntenteNotificationRepository.findSignatureEntenteNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmployeurEmail(
                SIGNATURE_ENTENTE_NOTIFICATION,
                "dummy@email.com"
        )).thenReturn(List.of(n9));

        NotificationsResponseDTO gestionnaireResult = gestionnaireService.getGestionnaireNotifications();
        NotificationsResponseDTO etudiantResult = etudiantService.getStudentsNotifications("dummy@email.com");
        NotificationsResponseDTO employeurResult = employeurService.getEmployeurNotifications("dummy@email.com");

        assertThat(gestionnaireResult).isNotNull();
        assertThat(gestionnaireResult.getTotalCount()).isEqualTo(5);
        assertThat(gestionnaireResult.getGroups()).hasSize(7);
        assertThat(gestionnaireResult.getGroups().get(0).getItems()).hasSize(2);
        assertThat(gestionnaireResult.getGroups().get(0).getItems().getFirst().getMessageEN()).isEqualTo("Stage submitted");
        assertThat(gestionnaireResult.getGroups().get(1).getItems().getFirst().getMessageEN()).isEqualTo("New application");
        assertThat(gestionnaireResult.getGroups().get(2).getItems().getFirst().getMessageEN()).isEqualTo("New CV uploaded");

        assertThat(etudiantResult).isNotNull();
        assertThat(etudiantResult.getTotalCount()).isEqualTo(5);
        assertThat(etudiantResult.getGroups()).hasSize(5);
        assertThat(etudiantResult.getGroups().getFirst().getItems()).hasSize(1);
        assertThat(etudiantResult.getGroups().getFirst().getItems().getFirst().getMessageEN()).isEqualTo("CV processed");
        assertThat(etudiantResult.getGroups().get(1).getItems().getFirst().getMessageEN()).isEqualTo("New convocation");
        assertThat(etudiantResult.getGroups().get(2).getItems().getFirst().getMessageEN()).isEqualTo("Candidature decision made");
        assertThat(etudiantResult.getGroups().get(3).getItems().getFirst().getMessageEN()).isEqualTo("Entente needs to be signed");
        assertThat(etudiantResult.getGroups().get(4).getItems().getFirst().getMessageEN()).isEqualTo("New assignation");

        assertThat(employeurResult).isNotNull();
        assertThat(employeurResult.getTotalCount()).isEqualTo(4);
        assertThat(employeurResult.getGroups()).hasSize(4);
        assertThat(employeurResult.getGroups().getFirst().getItems()).hasSize(1);
        assertThat(employeurResult.getGroups().getFirst().getItems().getFirst().getMessageEN()).isEqualTo("New application");
        assertThat(employeurResult.getGroups().get(1).getItems().getFirst().getMessageEN()).isEqualTo("Entente needs to be signed");
    }

    @Test
    @DisplayName("getNotifications() wraps repository failures into NotificationFetchException")
    void getNotifications_wrapsIntoNotificationFetchException() {
        when(notificationRepository.findNotificationsByTypeAndFirstRecipientReadAtIsNull(any()))
                .thenThrow(new RuntimeException("DB down"));

        assertThatThrownBy(() -> gestionnaireService.getGestionnaireNotifications())
                .isInstanceOf(NotificationExceptions.NotificationFetchException.class);

        verify(notificationRepository, times(1))
                .findNotificationsByTypeAndFirstRecipientReadAtIsNull(NotificationType.CREATION_STAGE_NOTIFICATION);
    }

    @Test
    @DisplayName("markPostulationAsReadBySecondRecipient() sets secondRecipientReadAt and saves")
    void markNotificationAsReadBySecondRecipient_setsReadAtAndSaves() throws Exception {
        Notification notification = new PostulationNotification();
        notification.setId(1L);

        when(notificationRepository.findById(1L)).thenReturn(java.util.Optional.of(notification));

        gestionnaireService.markPostulationAsReadBySecondRecipient(1L);

        assertThat(notification.getSecondRecipientReadAt()).isNotNull();
        verify(notificationRepository, times(1)).findById(1L);
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    @DisplayName("markPostulationAsReadBySecondRecipient() throws NotificationFetchException when not found")
    void markNotificationAsReadBySecondRecipient_notFound_throws() {
        when(notificationRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.markPostulationAsReadBySecondRecipient(1L))
                .isInstanceOf(NotificationExceptions.NotificationFetchException.class);

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("markPostulationAsReadBySecondRecipient() wraps save failures into NotificationFetchException")
    void markNotificationAsReadBySecondRecipient_saveThrows_wrapsException() {
        Notification notification = new PostulationNotification();
        notification.setId(1L);

        when(notificationRepository.findById(1L)).thenReturn(java.util.Optional.of(notification));
        doThrow(new RuntimeException("DB error")).when(notificationRepository).save(any());

        assertThatThrownBy(() -> gestionnaireService.markPostulationAsReadBySecondRecipient(1L))
                .isInstanceOf(NotificationExceptions.NotificationFetchException.class);

        verify(notificationRepository, times(1)).findById(1L);
        verify(notificationRepository, times(1)).save(any());
    }

}