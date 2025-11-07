package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.EtudiantCandidatureDTO;
import com.AL565.prose.service.dto.EtudiantCandidaturesDTO;
import com.AL565.prose.service.dto.GestionnairePasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.FailedToRetrieveStagesException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GestionnaireServiceTest {

    @Mock
    private GestionnaireRepository gestionnaireRepository;

    @Mock
    private StageRepository stageRepository;

    @Mock
    private EmployeurRepository employeurRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private CandidatureRepository candidatureRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private GestionnaireService gestionnaireService;

    @Test
    void saveGestionnaire_success() {
        GestionnairePasswordDTO dto = new GestionnairePasswordDTO();
        dto.setFirstName("Jean");
        dto.setLastName("Dupont");
        dto.setEmail("jean@example.com");
        dto.setPassword("password123");

        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");

        gestionnaireService.saveGestionnaire(dto);

        verify(gestionnaireRepository).save(any(Gestionnaire.class));
    }

    @Test
    void saveGestionnaire_emailExists() {
        GestionnairePasswordDTO dto = new GestionnairePasswordDTO();
        dto.setEmail("jean@example.com");
        dto.setPassword("password123");

        doThrow(new EmailAlreadyExistsException("existe déjà")).when(gestionnaireRepository).save(any(Gestionnaire.class));

        assertThatThrownBy(() -> gestionnaireService.saveGestionnaire(dto))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("existe déjà");
    }

    @Test
    void getStagesSoumises_returnsListOfStages() {
        Stage stage1 = new Stage();
        stage1.setId(1L);
        stage1.setTitle("Stage 1");
        stage1.setStatus(OfferStatus.SOUMISE);
        stage1.setEmployeurEmail("employer@company.com");

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setTitle("Stage 2");
        stage2.setStatus(OfferStatus.SOUMISE);
        stage2.setEmployeurEmail("employer@company.com");

        Employeur employeur = new Employeur();
        employeur.setId(1L);
        employeur.setCompany("Company");

        Credentials credentials = Credentials.builder()
                .username("employer@company.com")
                .password("encoded_password")
                .role(Role.EMPLOYEUR)
                .build();
        employeur.setCredentials(credentials);

        when(stageRepository.findByStatus(OfferStatus.SOUMISE)).thenReturn(List.of(stage1, stage2));
        when(employeurRepository.getEmployeurByCredentials_Username(anyString())).thenReturn(employeur);

        List<StageDTO> result = gestionnaireService.getStagesByStatus("SOUMISE", null);

        assertThat(result).hasSize(2);
        assertThat(result.getFirst().getId()).isEqualTo(1L);
        assertThat(result.getFirst().getTitle()).isEqualTo("Stage 1");
        assertThat(result.getFirst().getEmployeur().getCompany()).isEqualTo("Company");
    }

    @Test
    void approuverStage_success() {
        Stage stage = new Stage();
        stage.setId(1L);
        stage.setTitle("Stage Test");
        stage.setStatus(OfferStatus.SOUMISE);
        stage.setEmployeurEmail("employer@company.com");

        Employeur employeur = new Employeur();
        employeur.setId(1L);
        employeur.setCompany("Company");

        Credentials credentials = Credentials.builder()
                .username("employer@company.com")
                .password("encoded_password")
                .role(Role.EMPLOYEUR)
                .build();
        employeur.setCredentials(credentials);

        when(stageRepository.findById(1L)).thenReturn(Optional.of(stage));
        when(stageRepository.save(any(Stage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(employeurRepository.getEmployeurByCredentials_Username(anyString())).thenReturn(employeur);

        StageDTO result = gestionnaireService.approuverStage(1L);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(OfferStatus.APPROUVEE);
        verify(stageRepository).save(any(Stage.class));
    }

    @Test
    void approuverStage_stageNotFound() {
        when(stageRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.approuverStage(1L))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Stage non trouvé");
    }

    @Test
    void rejeterStage_success() {
        Stage stage = new Stage();
        stage.setId(1L);
        stage.setTitle("Stage Test");
        stage.setStatus(OfferStatus.SOUMISE);
        stage.setEmployeurEmail("employer@company.com");

        Employeur employeur = new Employeur();
        employeur.setId(1L);
        employeur.setCompany("Company");

        Credentials credentials = Credentials.builder()
                .username("employer@company.com")
                .password("encoded_password")
                .role(Role.EMPLOYEUR)
                .build();
        employeur.setCredentials(credentials);

        when(stageRepository.findById(1L)).thenReturn(Optional.of(stage));
        when(stageRepository.save(any(Stage.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(employeurRepository.getEmployeurByCredentials_Username(anyString())).thenReturn(employeur);

        StageDTO result = gestionnaireService.rejeterStage(1L, "Raison du rejet");

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(OfferStatus.REJETEE);
        verify(stageRepository).save(any(Stage.class));
    }

    @Test
    void rejeterStage_emptyReason() {
        assertThatThrownBy(() -> gestionnaireService.rejeterStage(1L, "  "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("raison du rejet est obligatoire");
    }

    @Test
    void rejeterStage_stageNotFound() {
        when(stageRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.rejeterStage(1L, "Raison"))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Stage non trouvé");
    }


    @Test
    @DisplayName("getAllStages() -> retourne des StageDTO mappés (happy path)")
    void getAllStages_returnsMappedDtos() {
        Stage s1 = Stage.builder()
                .id(1L)
                .title("Backend Java")
                .employeurEmail("emp1@company.com")
                .startDate(LocalDate.now())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        Stage s2 = Stage.builder()
                .id(2L)
                .title("Frontend React")
                .employeurEmail("emp2@company.com")
                .startDate(LocalDate.now())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        when(stageRepository.findAll()).thenReturn(List.of(s1, s2));

        Employeur e1 = new Employeur();
        e1.setCompany("Company 1");
        e1.setCredentials(
                com.AL565.prose.model.auth.Credentials.builder()
                        .username("emp1@company.com")
                        .password("x")        // peu importe pour le test
                        .role(com.AL565.prose.model.auth.Role.EMPLOYEUR)
                        .build()
        );

        Employeur e2 = new Employeur();
        e2.setCompany("Company 2");
        e2.setCredentials(
                com.AL565.prose.model.auth.Credentials.builder()
                        .username("emp2@company.com")
                        .password("x")
                        .role(com.AL565.prose.model.auth.Role.EMPLOYEUR)
                        .build()
        );

        when(employeurRepository.getEmployeurByCredentials_Username("emp1@company.com")).thenReturn(e1);
        when(employeurRepository.getEmployeurByCredentials_Username("emp2@company.com")).thenReturn(e2);

        List<StageDTO> result = gestionnaireService.getAllStages(null);

        assertThat(result).hasSize(2);
        verify(stageRepository, times(1)).findAll();
        verify(employeurRepository, times(1)).getEmployeurByCredentials_Username("emp1@company.com");
        verify(employeurRepository, times(1)).getEmployeurByCredentials_Username("emp2@company.com");
    }


    @Test
    @DisplayName("getAllStages() -> retourne une liste vide quand aucun stage n'existe")
    void getAllStages_returnsEmptyList_whenNoStages() {
        when(stageRepository.findAll()).thenReturn(Collections.emptyList());

        List<StageDTO> result = gestionnaireService.getAllStages(null);

        assertThat(result).isEmpty();
        verify(stageRepository, times(1)).findAll();
        verifyNoInteractions(employeurRepository);
    }

    @Test
    @DisplayName("getAllStages() -> wrap en FailedToRetrieveStagesException si le repo lève une exception")
    void getAllStages_whenRepoFails_wrapsToCustomException() {
        when(stageRepository.findAll()).thenThrow(new RuntimeException("DB down"));

        assertThatThrownBy(() -> gestionnaireService.getAllStages(null))
                .isInstanceOf(FailedToRetrieveStagesException.class);

        verify(stageRepository, times(1)).findAll();
        verifyNoInteractions(employeurRepository);
    }

    @Test
    void getAllStages2077() {
        Stage s1 = Stage.builder()
                .id(1L)
                .title("Backend Java++")
                .employeurEmail("emp1@company.com")
                .startDate(LocalDate.of(2077, 1, 18))
                .updatedAt(OffsetDateTime.now())
                .build();

        Stage s2 = Stage.builder()
                .id(2L)
                .title("VR/MR/HR QoL Creator")
                .employeurEmail("emp1@company.com")
                .startDate(LocalDate.of(2077, 2, 1))
                .updatedAt(null)
                .build();

        Stage s3 = Stage.builder()
                .id(3L)
                .title("Assembly C++++++")
                .employeurEmail("emp1@company.com")
                .startDate(LocalDate.of(2078, 3, 11))
                .updatedAt(OffsetDateTime.now())
                .build();

        when(stageRepository.findAll()).thenReturn(List.of(s1, s2, s3));

        Employeur e1 = new Employeur();
        e1.setCompany("Company 1");
        e1.setCredentials(
                com.AL565.prose.model.auth.Credentials.builder()
                        .username("emp1@company.com")
                        .password("x")        // peu importe pour le test
                        .role(com.AL565.prose.model.auth.Role.EMPLOYEUR)
                        .build()
        );

        when(employeurRepository.getEmployeurByCredentials_Username("emp1@company.com")).thenReturn(e1);

        List<StageDTO> result2077 = gestionnaireService.getAllStages("2077");
        List<StageDTO> result2078 = gestionnaireService.getAllStages("2078");
        List<StageDTO> result2025 = gestionnaireService.getAllStages("2025");

        assertThat(result2077).hasSize(2);
        assertThat(result2078).hasSize(1);
        assertThat(result2025).hasSize(0);
    }

    @Test
    void getAllEtudiantsCandidatures() {
        Etudiant john = new Etudiant("John", "Doe", Credentials.builder().username("email@email.com").password("1234567890").build(), Discipline.INFORMATIQUE);
        Etudiant umberto = new Etudiant("Umberto", "Larrios", Credentials.builder().username("email2@email.com").password("1234567890").build(), Discipline.INFORMATIQUE);

        Stage stage = new Stage();
        stage.setId(1L);
        stage.setTitle("Stage Test");
        stage.setStartDate(LocalDate.now());
        stage.setStatus(OfferStatus.SOUMISE);

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setTitle("Stage Test 2");
        stage2.setStartDate(LocalDate.now());
        stage2.setStatus(OfferStatus.SOUMISE);

        stage.setEmployeurEmail("employer@company.com");
        when(etudiantRepository.findAll()).thenReturn(List.of(john, umberto));

        when(candidatureRepository.findByEtudiant_Credentials_Username(john.getEmail())).thenReturn(List.of(
                new Candidature(1L, john, null, null, stage, LocalDateTime.now(), CandidatureStatus.SOUMISE, null, "Pending")
        ));

        when(candidatureRepository.findByEtudiant_Credentials_Username(umberto.getEmail())).thenReturn(List.of(
                new Candidature(2L, umberto, null, null, stage, LocalDateTime.now(), CandidatureStatus.SOUMISE, null, "Pending"),
                new Candidature(3L, umberto, null, null, stage2, LocalDateTime.now(), CandidatureStatus.SOUMISE, null, "Pending")
        ));

        when(employeurRepository.getEmployeurByCredentials_Username(anyString())).thenReturn(
                new  Employeur("Jean", "Employeur", "JeanEmployeurs", "jemployeur@gmail.com", "1234567890")
        );

        when(stageRepository.findById(anyLong())).thenReturn(Optional.of(stage));

        List<EtudiantCandidaturesDTO> candidatures =  gestionnaireService.getAllEtudiantsCandidatures(null);

        assertThat(candidatures).hasSize(2);
        assertThat(candidatures.get(0).getCandidatures()).hasSize(1);
        assertThat(candidatures.get(1).getCandidatures()).hasSize(2);
    }

    @Test
    void getAllEtudiantsCandidaturesStatus() {
        Etudiant john = new Etudiant("John", "Doe", Credentials.builder().username("email@email.com").password("1234567890").build(), Discipline.INFORMATIQUE);
        Etudiant umberto = new Etudiant("Umberto", "Larrios", Credentials.builder().username("email2@email.com").password("1234567890").build(), Discipline.INFORMATIQUE);

        Stage stage = new Stage();
        stage.setId(1L);
        stage.setTitle("Stage Test");
        stage.setStartDate(LocalDate.now());
        stage.setStatus(OfferStatus.SOUMISE);

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setTitle("Stage Test 2");
        stage2.setStartDate(LocalDate.now());
        stage2.setStatus(OfferStatus.SOUMISE);

        stage.setEmployeurEmail("employer@company.com");
        when(etudiantRepository.findAll()).thenReturn(List.of(john, umberto));

        when(candidatureRepository.findByEtudiant_Credentials_Username(john.getEmail())).thenReturn(List.of(
                new Candidature(1L, john, null, null, stage, LocalDateTime.now(), CandidatureStatus.ACCEPTEE, null, "Pending")
        ));

        when(candidatureRepository.findByEtudiant_Credentials_Username(umberto.getEmail())).thenReturn(List.of(
                new Candidature(2L, umberto, null, null, stage, LocalDateTime.now(), CandidatureStatus.ACCEPTEE, null, "Pending"),
                new Candidature(3L, umberto, null, null, stage2, LocalDateTime.now(), CandidatureStatus.REFUSEE, null, "Pending")
        ));

        when(employeurRepository.getEmployeurByCredentials_Username(anyString())).thenReturn(
                new  Employeur("Jean", "Employeur", "JeanEmployeurs", "jemployeur@gmail.com", "1234567890")
        );

        when(stageRepository.findById(anyLong())).thenReturn(Optional.of(stage));

        List<EtudiantCandidaturesDTO> candidatures =  gestionnaireService.getAllEtudiantsCandidatures(null);

        List<EtudiantCandidatureDTO> candidaturesJohn = candidatures.getFirst().getCandidatures();
        List<EtudiantCandidatureDTO> candidaturesUmberto = candidatures.get(1).getCandidatures();

        assertThat(candidaturesJohn.getFirst().getStatus()).isEqualTo(String.valueOf(CandidatureStatus.ACCEPTEE));
        assertThat(candidaturesUmberto.getFirst().getStatus()).isEqualTo(String.valueOf(CandidatureStatus.ACCEPTEE));
        assertThat(candidaturesUmberto.get(1).getStatus()).isEqualTo(String.valueOf(CandidatureStatus.REFUSEE));
    }
}