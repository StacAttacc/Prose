package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Stage;
import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.EmployeurDTO;
import com.AL565.prose.service.dto.EmployeurPasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.CandidatureNotFoundException;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.InvalidCandidatureModificationException;
import com.AL565.prose.utils.NotificationsHelper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
    private EtudiantOffreDecisionNotificationRepository etudiantOffreDecisionNotificationRepository;
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
        when(candidatureRepository.save(any())).thenReturn(candidature);
        when(employeurRepository.getEmployeurByCredentials_Username(anyString())).thenReturn(new Employeur());

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
}