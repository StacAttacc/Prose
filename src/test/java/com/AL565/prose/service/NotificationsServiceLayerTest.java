package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import com.AL565.prose.model.notifications.Notification;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.PostulationNotification;
import com.AL565.prose.model.notifications.StageNotification;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.EtudiantDTO;
import com.AL565.prose.service.dto.StageNotificationDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Method;
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
    @Mock
    private EtudiantRepository etudiantRepository;
    @Mock
    private CvRepository cvRepository;
    @Mock
    private StageRepository stageRepository;
    @Mock
    private CandidatureRepository candidatureRepository;
    @Mock
    private PostulationNotificationRepository postulationNotificationRepository;
    @Mock
    private NotificationsHelper notificationsHelper;

    @InjectMocks
    private EmployeurService employeurService;

    @InjectMocks
    private GestionnaireService gestionnaireService;

    @InjectMocks
    private EtudiantService etudiantService;

    @BeforeEach
    void setUpNotificationsHelper() {
        NotificationsHelper realHelper = new NotificationsHelper(notificationRepository);
        ReflectionTestUtils.setField(gestionnaireService, "notificationsHelper", realHelper);
    }

    @Test
    @DisplayName("createCandidature() saves a PostulationNotification")
    void createCandidature_createsPostulationNotification() throws Exception {
        String email = "jean.dupont@etudiant.ca";
        Long stageId = 1L;

        CandidatureDTO candidatureDTO = CandidatureDTO.builder()
                .stageId(stageId)
                .motivationLetterData("PDF".getBytes())
                .motivationLetterContentType(MediaType.APPLICATION_PDF_VALUE)
                .build();

        EtudiantDTO etuDto = new EtudiantDTO();
        etuDto.setEmail(email);
        candidatureDTO.setEtudiant(etuDto);

        Etudiant etudiant = new Etudiant();
        Credentials cred = new Credentials();
        cred.setUsername(email);
        cred.setRole(Role.ETUDIANT);
        etudiant.setCredentials(cred);

        CV cv = CV.builder()
                .id(1L)
                .name("cv.pdf")
                .type(MediaType.APPLICATION_PDF_VALUE)
                .size(1024L)
                .data(new byte[]{1,2,3})
                .etudiant(etudiant)
                .status(CvStatus.APPROVED)
                .build();

        Stage stage = new Stage();
        stage.setId(stageId);
        stage.setTitle("Développeur Java");
        stage.setEmployeurEmail("employer@company.com");

        Candidature savedCandidature = new Candidature();
        savedCandidature.setId(10L);
        savedCandidature.setEtudiant(etudiant);
        savedCandidature.setStage(stage);
        savedCandidature.setDateCandidature(LocalDateTime.now());
        savedCandidature.setStatus(OfferStatus.SOUMISE);

        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId)).thenReturn(false);
        when(etudiantRepository.findEtudiantByCredentials_Username(email)).thenReturn(Optional.of(etudiant));
        when(cvRepository.findByEtudiant_Credentials_Username(email)).thenReturn(Optional.of(cv));
        when(stageRepository.findById(stageId)).thenReturn(Optional.of(stage));
        when(candidatureRepository.save(any(Candidature.class))).thenReturn(savedCandidature);
        when(notificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        etudiantService.createCandidature(candidatureDTO);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification savedNotification = captor.getValue();
        assertThat(savedNotification).isInstanceOf(PostulationNotification.class);

        PostulationNotification postulation = (PostulationNotification) savedNotification;
        assertThat(postulation.getCandidature()).isNotNull();
        assertThat(postulation.getCandidature().getStage().getId()).isEqualTo(stageId);
        assertThat(postulation.getSenderEmail()).isEqualTo(email);
        assertThat(postulation.getType()).isEqualTo(NotificationType.STAGE_NOTIFICATION);
        assertThat(postulation.getMessage()).contains("Candidature");
        assertThat(postulation.getReadAt()).isNull();
        assertThat(postulation.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("createNotificationForNewStage() posts a StageNotification")
    void createNotificationForNewStage_postsStageNotification() throws Exception {
        Stage stage = new Stage();
        stage.setId(5L);
        stage.setTitle("New Stage Title");
        stage.setEmployeurEmail("employer@company.com");

        Method m = EmployeurService.class.getDeclaredMethod("createNotificationForNewStage", Stage.class);
        m.setAccessible(true);

        when(notificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        m.invoke(employeurService, stage);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification savedNotification = captor.getValue();
        assertThat(savedNotification).isInstanceOf(StageNotification.class);

        StageNotification stageNotification = (StageNotification) savedNotification;
        assertThat(stageNotification.getStage()).isEqualTo(stage);
        assertThat(stageNotification.getSenderEmail()).isEqualTo(stage.getEmployeurEmail());
        assertThat(stageNotification.getMessage()).isEqualTo(stage.getTitle());
        assertThat(stageNotification.getType()).isEqualTo(NotificationType.STAGE_NOTIFICATION);
        assertThat(stageNotification.getReadAt()).isNull();
        assertThat(stageNotification.getCreatedAt()).isNotNull();
    }

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

        when(notificationRepository.findNotificationsByTypeAndReadAt(NotificationType.STAGE_NOTIFICATION, null))
                .thenReturn(List.of(n1, n2));

        StageNotificationDTO result = gestionnaireService.getStageNotifications();

        assertThat(result.getStageNotifications()).hasSize(2);
        assertThat(result.getStageNotifications().getFirst()).isInstanceOf(StageNotification.class);
        assertThat(result.getStageNotifications().getFirst().getType()).isEqualTo(NotificationType.STAGE_NOTIFICATION);
        assertThat(result.getStageNotifications().getFirst().getMessage()).isEqualTo("Stage submitted");

        verify(notificationRepository, times(1))
                .findNotificationsByTypeAndReadAt(NotificationType.STAGE_NOTIFICATION, null);
        verifyNoMoreInteractions(notificationRepository);
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
                .isInstanceOf(NotificationExceptions.NotificationFetchException.class);

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markNotificationAsRead_saveThrows_wrappsToNotificationFetchException() {
        Notification notification = new StageNotification();
        notification.setId(1L);

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        doThrow(new RuntimeException("DB")).when(notificationRepository).save(any(Notification.class));

        assertThatThrownBy(() -> gestionnaireService.markNotificationAsRead(1L))
                .isInstanceOf(NotificationExceptions.NotificationFetchException.class);
    }

    @Test
    @DisplayName("getPostulationNotifications() returns postulation notifications and count")
    void getPostulationNotifications_returnsPostulationNotificationsDTO() throws Exception {
        String employeurEmail = "employer@company.com";

        PostulationNotification pn = new PostulationNotification();
        pn.setId(1L);
        Candidature cand = new Candidature();
        Stage stage = new Stage();
        stage.setId(5L);
        stage.setEmployeurEmail(employeurEmail);
        cand.setStage(stage);
        pn.setCandidature(cand);
        pn.setSenderEmail("jean.dupont@etudiant.ca");
        pn.setType(NotificationType.STAGE_NOTIFICATION);
        pn.setMessage("Candidature");
        pn.setCreatedAt(LocalDateTime.now());

        when(postulationNotificationRepository
                .findByReadAtAndCandidature_StageEmployeurEmail(null, employeurEmail))
                .thenReturn(List.of(pn));

        com.AL565.prose.service.dto.PostulationNotificationDTO result =
                employeurService.getPostulationNotifications(employeurEmail);

        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(1);
        assertThat(result.getPostulationNotifications()).hasSize(1);
        assertThat(result.getPostulationNotifications().get(0).getSenderEmail())
                .isEqualTo("jean.dupont@etudiant.ca");

        verify(postulationNotificationRepository, times(1))
                .findByReadAtAndCandidature_StageEmployeurEmail(null, employeurEmail);
    }

    @Test
    @DisplayName("getPostulationNotifications() wraps repository failures into Exception")
    void getPostulationNotifications_wrapsException() {
        when(postulationNotificationRepository.findByReadAtAndCandidature_StageEmployeurEmail(any(), any()))
                .thenThrow(new RuntimeException("DB down"));

        assertThatThrownBy(() -> employeurService.getPostulationNotifications("employer@company.com"))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("Erreur lors de la récupération des notifications de postulation");
    }

    @Test
    @DisplayName("markNotificationAsRead() delegates to NotificationsHelper")
    void markNotificationAsRead_delegatesToHelper_success() throws Exception {
        ReflectionTestUtils.setField(employeurService, "notificationsHelper", notificationsHelper);
        doNothing().when(notificationsHelper).markNotificationAsRead(1L);

        employeurService.markNotificationAsRead(1L);

        verify(notificationsHelper, times(1)).markNotificationAsRead(1L);
    }

    @Test
    @DisplayName("markNotificationAsRead() propagates helper exception")
    void markNotificationAsRead_helperThrows_propagatesException() throws Exception {
        ReflectionTestUtils.setField(employeurService, "notificationsHelper", notificationsHelper);
        doThrow(new Exception("boom")).when(notificationsHelper).markNotificationAsRead(1L);

        assertThatThrownBy(() -> employeurService.markNotificationAsRead(1L))
                .isInstanceOf(Exception.class)
                .hasMessageContaining("boom");

        verify(notificationsHelper, times(1)).markNotificationAsRead(1L);
    }
}