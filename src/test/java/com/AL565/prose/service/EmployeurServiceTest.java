package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Stage;
import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.notifications.EmployeurResponseNotification;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.EmployeurDTO;
import com.AL565.prose.service.dto.EmployeurPasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.CandidatureNotFoundException;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.InvalidCandidatureModificationException;
import com.AL565.prose.utils.NotificationsHelper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeurServiceTest {
    @Mock
    private ProseUserRepository proseUserRepository;
    @Mock
    private EmployeurRepository employeurRepository;
    @Mock
    private StageRepository stageRepository;
    @Mock
    private CandidatureRepository candidatureRepository;
    @Mock
    private PasswordEncoder passwordEncoder; 
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private PostulationNotificationRepository postulationNotificationRepository;
    @Mock
    private EmployeurResponseNotificationRepository employeurResponseNotificationRepository;
    @Mock
    private NotificationsHelper notificationsHelper;

    @InjectMocks
    private EmployeurService employeurService;

    @Test
    void enregistrer() throws EmailAlreadyExistsException {
        Employeur employeur = new Employeur("Justin", "Trudeau", "Gouvernement du Canada", "jt@gov.ca", "gouvernement");
        EmployeurPasswordDTO justin = new EmployeurPasswordDTO(employeur);

        employeurService.enregistrer(justin);

        verify(employeurRepository, times(1)).save(any());
    }

    @Test
    void getEmployeur() {
        Employeur mark = new Employeur("Mark", "Carney", "Gouvernement du Canada", "mc@gov.ca", "gouvernement");
        mark.setId(1L);

        when(proseUserRepository.findByCredentials_Username("mc@gov.ca")).thenReturn(Optional.of(mark));

        EmployeurDTO markDTO = employeurService.getEmployeur("mc@gov.ca");

        assertEquals(1L, markDTO.getId());
    }


    @Test
    void createStage() {
        Employeur employeur = new Employeur(8L, "Umberto", "Macaco", "Zac inc", "email");
        EmployeurDTO empDto = new EmployeurDTO(employeur, null);

        var dto = StageDTO.builder()
                .title("Stagiaire Java")
                .description("Développer des APIs Spring")
                .requirements("Java, Spring, SQL")
                .skills(List.of("Java", "Spring"))
                .startDate(LocalDate.now().plusDays(7))
                .endDate(LocalDate.now().plusWeeks(12))
                .location("Montréal")
                .workMode("HYBRIDE")
                .compensation("22$/h")
                .employeur(empDto)
                .build();

        when(stageRepository.save(any(Stage.class))).thenAnswer(inv -> {
            Stage s = inv.getArgument(0);
            s.setId(42L);
            return s;
        });

        when(employeurRepository.getEmployeurByCredentials_Username(any(String.class))).thenReturn(employeur);

        StageDTO out = employeurService.createStage(dto);

        assertThat(out.getId()).isEqualTo(42L);
        assertThat(out.getStatus().name()).isEqualTo("SOUMISE");
        verify(stageRepository, times(1)).save(any(Stage.class));
    }

    @Test
    void createStage_throw_illegalArgument_siDtoNull() {
        var employeur = new Employeur();
        employeur.setId(7L);

        assertThatThrownBy(() -> employeurService.createStage(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("stage must not be null");

        verifyNoInteractions(stageRepository);
    }

    @Test
    void getPostulations() throws Exception {
        Stage stage = new Stage(1L, "Démissioner", "Partir immédiatement!", "Rien", new ArrayList<>(), LocalDate.now(), LocalDate.now(), "Chez vous", null, "Remote", "0$", OfferStatus.APPROUVEE, "jemployeur1@gmail.com", OffsetDateTime.now(), OffsetDateTime.now());

        when(stageRepository.findById(anyLong())).thenReturn(Optional.of(stage));
        when(candidatureRepository.findAllByStage_Id(anyLong())).thenReturn(Optional.of(List.of(
                new Candidature(1L,
                        new Etudiant("John", "Doe", Credentials.builder().username("john@doe.com").password("password123").build(), Discipline.INFORMATIQUE),
                        null,
                        null,
                        stage,
                        LocalDateTime.now(),
                        CandidatureStatus.SOUMISE,
                        null,
                        null),
                new Candidature(2L,
                        new Etudiant("Umberto", "Larrios", Credentials.builder().username("umberto@doe.com").password("password123").build(), Discipline.INFORMATIQUE),
                        null,
                        null,
                        stage,
                        LocalDateTime.now(),
                        CandidatureStatus.SOUMISE,
                        null,
                        null)
        )));

        List<CandidatureDTO> candidatures = employeurService.getStageCandidatures(stage.getId());

        assertThat(candidatures.size()).isEqualTo(2);
    }

    @Test
    void approveCandidature() throws CandidatureNotFoundException, InvalidCandidatureModificationException {
        Stage stage = new Stage(1L, "Démissioner", "Partir immédiatement!", "Rien", new ArrayList<>(), LocalDate.now(), LocalDate.now(), "Chez vous", null, "Remote", "0$", OfferStatus.APPROUVEE, "jemployeur1@gmail.com", OffsetDateTime.now(), OffsetDateTime.now());

        Candidature candidature = new Candidature(
                1L,
                new Etudiant("Umberto", "Larrios", Credentials.builder().username("umberto@gmail.com").password("1234567890").build(), Discipline.INFORMATIQUE),
                null,
                null,
                stage,
                LocalDateTime.now(),
                CandidatureStatus.CONVOQUEE,
                null,
                ""
        );

        when(candidatureRepository.findById(anyLong())).thenReturn(Optional.of(candidature));

        employeurService.updateCandidatureStatus(candidature.getId(), "Acceptee");

        verify(candidatureRepository, times(1)).save(candidature);
    }

    @Test
    void approveCandidatureBeforeConvocationException() throws CandidatureNotFoundException, InvalidCandidatureModificationException {
        Stage stage = new Stage(1L, "Démissioner", "Partir immédiatement!", "Rien", new ArrayList<>(), LocalDate.now(), LocalDate.now(), "Chez vous", null, "Remote", "0$", OfferStatus.APPROUVEE, "jemployeur1@gmail.com", OffsetDateTime.now(), OffsetDateTime.now());

        Candidature candidature = new Candidature(
                1L,
                new Etudiant("Umberto", "Larrios", Credentials.builder().username("umberto@gmail.com").password("1234567890").build(), Discipline.INFORMATIQUE),
                null,
                null,
                stage,
                LocalDateTime.now(),
                CandidatureStatus.SOUMISE,
                null,
                ""
        );

        when(candidatureRepository.findById(anyLong())).thenReturn(Optional.of(candidature));

        assertThatThrownBy(() -> employeurService.updateCandidatureStatus(candidature.getId(), "Acceptee"))
                .isInstanceOf(InvalidCandidatureModificationException.class);
    }

    @Test
    void getEmployeurResponseNotifications_success() throws Exception {
        String employeurEmail = "employeur@test.com";

        EmployeurResponseNotification notification1 = new EmployeurResponseNotification();
        notification1.setId(1L);
        notification1.setEmployeurResponseEmail(employeurEmail);
        notification1.setCandidatureResponseId(10L);
        notification1.setEtudiantResponseId(5L);
        notification1.setStageResponseId(3L);
        notification1.setAccepted(true);
        notification1.setComment("Je suis ravi d'accepter!");
        notification1.setMessage("Jean Dupont a accepté l'offre pour le stage Développeur Java");
        notification1.setCreatedAt(LocalDateTime.now());
        notification1.setFirstRecipientReadAt(null);

        EmployeurResponseNotification notification2 = new EmployeurResponseNotification();
        notification2.setId(2L);
        notification2.setEmployeurResponseEmail(employeurEmail);
        notification2.setCandidatureResponseId(11L);
        notification2.setEtudiantResponseId(6L);
        notification2.setStageResponseId(3L);
        notification2.setAccepted(false);
        notification2.setComment("J'ai accepté une autre offre");
        notification2.setMessage("Marie Tremblay a refusé l'offre pour le stage Développeur Java");
        notification2.setCreatedAt(LocalDateTime.now());
        notification2.setFirstRecipientReadAt(null);

        List<EmployeurResponseNotification> notifications = List.of(notification1, notification2);

        when(employeurResponseNotificationRepository.findByEmployeurResponseEmailAndFirstRecipientReadAt(employeurEmail, null))
                .thenReturn(notifications);

        NotificationsResponseDTO result = employeurService.getEmployeurResponseNotifications(employeurEmail);

        assertThat(result).isNotNull();
        assertThat(result.getTotalCount()).isEqualTo(2);
        assertThat(result.getGroups().size()).isEqualTo(1);
        assertThat(result.getGroups().get(0).getTypeKey()).isEqualTo("employeur_response");
        assertThat(result.getGroups().get(0).getItems().size()).isEqualTo(2);

        verify(employeurResponseNotificationRepository, times(1))
                .findByEmployeurResponseEmailAndFirstRecipientReadAt(employeurEmail, null);
    }

    @ParameterizedTest
    @CsvSource({
            "2077, 2",
            "2078, 1",
            "2025, 0"
    })
    void getStagesForDated(String year, int expected) {
        Stage stage1 = new Stage(1L, "Travailler", "Programmez dans mon entreprise!", "Techniques de l'Informatique", new ArrayList<>(), LocalDate.of(2077, 1, 15), LocalDate.of(2077, 1, 21), "", null, "Remote", "26$/h", OfferStatus.APPROUVEE, "jemployeur1@gmail.com", OffsetDateTime.now(), OffsetDateTime.now());
        Stage stage2 = new Stage(2L, "Démissioner", "Partir immédiatement!", "Rien", new ArrayList<>(), LocalDate.of(2077, 5, 6), LocalDate.of(2077, 5, 7), "Chez vous", null, "Remote", "0$", OfferStatus.APPROUVEE, "jemployeur1@gmail.com", OffsetDateTime.now(), OffsetDateTime.now());
        Stage stage3 = new Stage(3L, "Revenir", "J'ai besoin de stagiaires!", "Rien", new ArrayList<>(), LocalDate.of(2078, 3, 6), LocalDate.of(2078, 3, 7), "Au bureau", null, "Présentiel", "40$/h", OfferStatus.APPROUVEE, "jemployeur1@gmail.com", OffsetDateTime.now(), OffsetDateTime.now());

        Employeur jean = new Employeur("Jean", "Jacques", "JeanEmployeurs", "jemployeur1@gmail.com", "jeanemployeur");

        when(stageRepository.findByEmployeurEmail(anyString())).thenReturn(List.of(stage1, stage2, stage3));
        when(employeurRepository.getEmployeurByCredentials_Username(anyString())).thenReturn(jean);

        List<StageDTO> stages = employeurService.listStagesFor("jemployeur1@gmail.com", year);

        assertThat(stages.size()).isEqualTo(expected);
    }
}