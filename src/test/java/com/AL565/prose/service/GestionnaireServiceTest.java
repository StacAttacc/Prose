package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.EtudiantAlreadyAssociatedException;
import com.AL565.prose.service.exceptions.FailedToRetrieveStagesException;
import org.junit.jupiter.api.DisplayName;
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
    private ProfesseurRepository professeurRepository;

    @Mock
    private CandidatureRepository candidatureRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private CvRepository cvRepository;

    @Mock
    private ProfesseurService professeurService;

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
        stage1.setStartDate(LocalDate.now());
        stage1.setEmployeurEmail("employer@company.com");

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setTitle("Stage 2");
        stage2.setStatus(OfferStatus.SOUMISE);
        stage2.setStartDate(LocalDate.now());
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

        List<StageDTO> result = gestionnaireService.getStagesByStatus("SOUMISE", String.valueOf(LocalDate.now().getYear()));

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
        when(notificationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

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
                .build();

        Stage s2 = Stage.builder()
                .id(2L)
                .title("Frontend React")
                .employeurEmail("emp2@company.com")
                .startDate(LocalDate.now())
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

    @ParameterizedTest
    @CsvSource({
            "2077, 2",
            "2078, 1",
            "2025, 0"
    })
    void getAllStagesYearFiltered(String year, String expected) {
        Stage s1 = Stage.builder()
                .id(1L)
                .title("Backend Java++")
                .employeurEmail("emp1@company.com")
                .startDate(LocalDate.of(2077, 1, 18))
                .build();

        Stage s2 = Stage.builder()
                .id(2L)
                .title("VR/MR/HR QoL Creator")
                .employeurEmail("emp1@company.com")
                .startDate(LocalDate.of(2077, 2, 1))
                .build();

        Stage s3 = Stage.builder()
                .id(3L)
                .title("Assembly C++++++")
                .employeurEmail("emp1@company.com")
                .startDate(LocalDate.of(2078, 3, 11))
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

        List<StageDTO> result = gestionnaireService.getAllStages(year);

        assertThat(result).hasSize(Integer.parseInt(expected));
    }

    @Test
    void getAllEtudiantsCandidatures() {
        Etudiant john = new Etudiant("John", "Doe", Credentials.builder().username("email@email.com").password("1234567890").build(), Discipline.INFORMATIQUE);
        Etudiant umberto = new Etudiant("Umberto", "Larrios", Credentials.builder().username("email2@email.com").password("1234567890").build(), Discipline.INFORMATIQUE);

        Stage stage = new Stage();
        stage.setId(1L);
        stage.setTitle("Stage Test");
        stage.setEmployeurEmail("employer@company.com");
        stage.setStartDate(LocalDate.now());
        stage.setStatus(OfferStatus.SOUMISE);

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setTitle("Stage Test 2");
        stage2.setEmployeurEmail("employer@company.com");
        stage2.setStartDate(LocalDate.now());
        stage2.setStatus(OfferStatus.SOUMISE);

        stage.setEmployeurEmail("employer@company.com");
        when(etudiantRepository.findAll()).thenReturn(List.of(john, umberto));

        when(candidatureRepository.findByEtudiant_Credentials_Username(john.getEmail())).thenReturn(List.of(
                new Candidature(1L, john, null, null, stage, LocalDateTime.now(), CandidatureStatus.SOUMISE, null, "Pending", null)
        ));

        when(candidatureRepository.findByEtudiant_Credentials_Username(umberto.getEmail())).thenReturn(List.of(
                new Candidature(2L, umberto, null, null, stage, LocalDateTime.now(), CandidatureStatus.SOUMISE, null, "Pending", null),
                new Candidature(3L, umberto, null, null, stage2, LocalDateTime.now(), CandidatureStatus.SOUMISE, null, "Pending", null)
        ));

        when(employeurRepository.getEmployeurByCredentials_Username(anyString())).thenReturn(
                new  Employeur("Jean", "Employeur", "JeanEmployeurs", "jemployeur@gmail.com", "1234567890")
        );

        when(stageRepository.findById(stage.getId())).thenReturn(Optional.of(stage));
        when(stageRepository.findById(stage2.getId())).thenReturn(Optional.of(stage2));

        List<EtudiantCandidaturesDTO> candidatures =  gestionnaireService.getAllEtudiantsCandidatures(String.valueOf(LocalDate.now().getYear()));

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
        stage.setEmployeurEmail("employer@company.com");
        stage.setStartDate(LocalDate.now());
        stage.setStatus(OfferStatus.SOUMISE);

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setTitle("Stage Test 2");
        stage2.setEmployeurEmail("employer@company.com");
        stage2.setStartDate(LocalDate.now());
        stage2.setStatus(OfferStatus.SOUMISE);

        when(etudiantRepository.findAll()).thenReturn(List.of(john, umberto));

        when(candidatureRepository.findByEtudiant_Credentials_Username(john.getEmail())).thenReturn(List.of(
                new Candidature(1L, john, null, null, stage, LocalDateTime.now(), CandidatureStatus.ACCEPTEE, null, "Pending", null)
        ));

        when(candidatureRepository.findByEtudiant_Credentials_Username(umberto.getEmail())).thenReturn(List.of(
                new Candidature(2L, umberto, null, null, stage, LocalDateTime.now(), CandidatureStatus.ACCEPTEE, null, "Pending", null),
                new Candidature(3L, umberto, null, null, stage2, LocalDateTime.now(), CandidatureStatus.REFUSEE, null, "Pending", null)
        ));

        when(employeurRepository.getEmployeurByCredentials_Username(anyString())).thenReturn(
                new  Employeur("Jean", "Employeur", "JeanEmployeurs", "jemployeur@gmail.com", "1234567890")
        );

        when(stageRepository.findById(stage.getId())).thenReturn(Optional.of(stage));
        when(stageRepository.findById(stage2.getId())).thenReturn(Optional.of(stage2));

        List<EtudiantCandidaturesDTO> candidatures =  gestionnaireService.getAllEtudiantsCandidatures(String.valueOf(LocalDate.now().getYear()));

        List<EtudiantCandidatureDTO> candidaturesJohn = candidatures.getFirst().getCandidatures();
        List<EtudiantCandidatureDTO> candidaturesUmberto = candidatures.get(1).getCandidatures();

        assertThat(candidaturesJohn.getFirst().getStatus()).isEqualTo(String.valueOf(CandidatureStatus.ACCEPTEE));
        assertThat(candidaturesUmberto.getFirst().getStatus()).isEqualTo(String.valueOf(CandidatureStatus.ACCEPTEE));
        assertThat(candidaturesUmberto.get(1).getStatus()).isEqualTo(String.valueOf(CandidatureStatus.REFUSEE));
    }

    @ParameterizedTest
    @CsvSource({
            "2077, 2",
            "2078, 1",
            "2025, 0"
    })
    void getAllEtudiantsCandidaturesYearFiltered(String year, String expected) {
        Etudiant john = new Etudiant("John", "Doe", Credentials.builder().username("email@email.com").password("1234567890").build(), Discipline.INFORMATIQUE);
        Etudiant umberto = new Etudiant("Umberto", "Larrios", Credentials.builder().username("email2@email.com").password("1234567890").build(), Discipline.INFORMATIQUE);

        Stage stage = new Stage();
        stage.setId(1L);
        stage.setTitle("Stage Test");
        stage.setStartDate(LocalDate.of(2077, 5, 25));
        stage.setEmployeurEmail("employer@company.com");
        stage.setStatus(OfferStatus.SOUMISE);

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setTitle("Stage Test 2");
        stage2.setEmployeurEmail("employer@company.com");
        stage2.setStartDate(LocalDate.of(2077, 7, 1));
        stage2.setStatus(OfferStatus.SOUMISE);

        Stage stage3 = new Stage();
        stage3.setId(3L);
        stage3.setTitle("Stage Test 3");
        stage3.setEmployeurEmail("employer@company.com");
        stage3.setStartDate(LocalDate.of(2078, 3, 12));
        stage3.setStatus(OfferStatus.SOUMISE);

        when(etudiantRepository.findAll()).thenReturn(List.of(john, umberto));

        when(candidatureRepository.findByEtudiant_Credentials_Username(john.getEmail())).thenReturn(List.of(
                new Candidature(1L, john, null, null, stage, LocalDateTime.now(), CandidatureStatus.SOUMISE, null, "Pending", null),
                new Candidature(4L, john, null, null, stage3, LocalDateTime.now(), CandidatureStatus.SOUMISE, null, "Pending", null)
        ));

        when(candidatureRepository.findByEtudiant_Credentials_Username(umberto.getEmail())).thenReturn(List.of(
                new Candidature(2L, umberto, null, null, stage, LocalDateTime.now(), CandidatureStatus.SOUMISE, null, "Pending", null),
                new Candidature(3L, umberto, null, null, stage2, LocalDateTime.now(), CandidatureStatus.SOUMISE, null, "Pending", null)
        ));

        when(employeurRepository.getEmployeurByCredentials_Username(anyString())).thenReturn(
                new  Employeur("Jean", "Employeur", "JeanEmployeurs", "jemployeur@gmail.com", "1234567890")
        );

        when(stageRepository.findById(stage.getId())).thenReturn(Optional.of(stage));
        when(stageRepository.findById(stage2.getId())).thenReturn(Optional.of(stage2));
        when(stageRepository.findById(stage3.getId())).thenReturn(Optional.of(stage3));

        List<EtudiantCandidaturesDTO> candidatures =  gestionnaireService.getAllEtudiantsCandidatures(year);

        assertThat(candidatures).hasSize(Integer.parseInt(expected));
    }

    @Test
    void testAssociationEtudiant() throws EtudiantAlreadyAssociatedException {
        Etudiant etudiant = new Etudiant("John", "Doe", new Credentials("john@doe.com", "password123", Role.ETUDIANT), Discipline.INFORMATIQUE);
        Professeur professeur = new Professeur("Robert", "Brassard", "robert@brassard.com", "password123", Discipline.INFORMATIQUE);

        when(etudiantRepository.findEtudiantByCredentials_Username(anyString())).thenReturn(Optional.of(etudiant));
        when(professeurRepository.findByCredentials_Username(anyString())).thenReturn(Optional.of(professeur));

        gestionnaireService.associateProfesseurToEtudiant(new ProfesseurAssociationDTO(etudiant.getEmail(), professeur.getEmail()));

        verify(etudiantRepository, times(1)).save(etudiant);
    }

    @Test
    void testAssociationEtudiantAlreadyAssociated() {
        Etudiant etudiant = new Etudiant("John", "Doe", new Credentials("john@doe.com", "password123", Role.ETUDIANT), Discipline.INFORMATIQUE);
        Professeur professeur = new Professeur("Robert", "Brassard", "robert@brassard.com", "password123", Discipline.INFORMATIQUE);

        etudiant.setProfesseurResponsable(professeur);

        when(etudiantRepository.findEtudiantByCredentials_Username(anyString())).thenReturn(Optional.of(etudiant));
        when(professeurRepository.findByCredentials_Username(anyString())).thenReturn(Optional.of(professeur));

        assertThatThrownBy(() -> gestionnaireService.associateProfesseurToEtudiant(new ProfesseurAssociationDTO(etudiant.getEmail(), professeur.getEmail())))
                .isInstanceOf(EtudiantAlreadyAssociatedException.class);
    }

    @Test
    @DisplayName("createProfesseur - Succès")
    void createProfesseur_success() {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("Robert");
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline("INFORMATIQUE");

        doNothing().when(professeurService).register(any(ProfesseurPasswordDTO.class));

        gestionnaireService.createProfesseur(dto);

        verify(professeurService, times(1)).register(any(ProfesseurPasswordDTO.class));
    }

    @Test
    @DisplayName("createProfesseur - Prénom manquant")
    void createProfesseur_missingFirstName() {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName(null);
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline("INFORMATIQUE");

        assertThatThrownBy(() -> gestionnaireService.createProfesseur(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Le prénom est requis");
    }

    @Test
    @DisplayName("createProfesseur - Prénom vide")
    void createProfesseur_emptyFirstName() {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("   ");
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline("INFORMATIQUE");

        assertThatThrownBy(() -> gestionnaireService.createProfesseur(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Le prénom est requis");
    }

    @Test
    @DisplayName("createProfesseur - Nom manquant")
    void createProfesseur_missingLastName() {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("Robert");
        dto.setLastName(null);
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline("INFORMATIQUE");

        assertThatThrownBy(() -> gestionnaireService.createProfesseur(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Le nom est requis");
    }

    @Test
    @DisplayName("createProfesseur - Email manquant")
    void createProfesseur_missingEmail() {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("Robert");
        dto.setLastName("Duval");
        dto.setEmail(null);
        dto.setPassword("password123");
        dto.setDiscipline("INFORMATIQUE");

        assertThatThrownBy(() -> gestionnaireService.createProfesseur(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("L'email est requis");
    }

    @Test
    @DisplayName("createProfesseur - Mot de passe manquant")
    void createProfesseur_missingPassword() {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("Robert");
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword(null);
        dto.setDiscipline("INFORMATIQUE");

        assertThatThrownBy(() -> gestionnaireService.createProfesseur(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Le mot de passe est requis");
    }

    @Test
    @DisplayName("createProfesseur - Discipline manquante")
    void createProfesseur_missingDiscipline() {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("Robert");
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline(null);

        assertThatThrownBy(() -> gestionnaireService.createProfesseur(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("La discipline est requise");
    }

    @Test
    @DisplayName("createProfesseur - Discipline invalide")
    void createProfesseur_invalidDiscipline() {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("Robert");
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline("INVALID_DISCIPLINE");

        assertThatThrownBy(() -> gestionnaireService.createProfesseur(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Discipline invalide");
    }

    @Test
    @DisplayName("createProfesseur - Email déjà existant")
    void createProfesseur_emailAlreadyExists() {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("Robert");
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline("INFORMATIQUE");

        doThrow(new EmailAlreadyExistsException("Un compte avec cet email existe déjà"))
                .when(professeurService).register(any(ProfesseurPasswordDTO.class));

        assertThatThrownBy(() -> gestionnaireService.createProfesseur(dto))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("Un compte avec cet email existe déjà");
    }

    @Test
    @DisplayName("assignStageToStudent - Succès")
    void assignStageToStudent_success() {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);
        dto.setComment("Stage attribué par le gestionnaire");

        Etudiant etudiant = new Etudiant("John", "Doe", 
                new Credentials("etudiant@example.com", "password123", Role.ETUDIANT), 
                Discipline.INFORMATIQUE);
        CV cv = CV.builder()
                .id(1L)
                .etudiant(etudiant)
                .status(CvStatus.APPROVED)
                .build();
        Stage stage = Stage.builder()
                .id(1L)
                .title("Stage en développement")
                .status(OfferStatus.APPROUVEE)
                .employeurEmail("employeur@example.com")
                .build();

        when(etudiantRepository.findEtudiantByCredentials_Username("etudiant@example.com"))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.findByEtudiant_Credentials_Username("etudiant@example.com"))
                .thenReturn(Optional.of(cv));
        when(stageRepository.findById(1L)).thenReturn(Optional.of(stage));
        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id("etudiant@example.com", 1L))
                .thenReturn(false);
        when(candidatureRepository.save(any(Candidature.class))).thenAnswer(invocation -> {
            Candidature c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });

        CandidatureDTO result = gestionnaireService.assignStageToStudent(dto);

        assertThat(result).isNotNull();
        assertThat(result.getStageId()).isEqualTo(1L);
        verify(candidatureRepository, times(1)).save(any(Candidature.class));
        verify(notificationRepository, times(1)).save(any(com.AL565.prose.model.notifications.Notification.class));
    }

    @Test
    @DisplayName("assignStageToStudent - Email étudiant manquant")
    void assignStageToStudent_missingEmail() {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail(null);
        dto.setStageId(1L);

        assertThatThrownBy(() -> gestionnaireService.assignStageToStudent(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("L'email de l'étudiant est requis");
    }

    @Test
    @DisplayName("assignStageToStudent - Stage ID manquant")
    void assignStageToStudent_missingStageId() {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(null);

        assertThatThrownBy(() -> gestionnaireService.assignStageToStudent(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("L'ID du stage est requis");
    }

    @Test
    @DisplayName("assignStageToStudent - Étudiant non trouvé")
    void assignStageToStudent_studentNotFound() {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);

        when(etudiantRepository.findEtudiantByCredentials_Username("etudiant@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.assignStageToStudent(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Étudiant non trouvé");
    }

    @Test
    @DisplayName("assignStageToStudent - CV non trouvé")
    void assignStageToStudent_cvNotFound() {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);

        Etudiant etudiant = new Etudiant("John", "Doe", 
                new Credentials("etudiant@example.com", "password123", Role.ETUDIANT), 
                Discipline.INFORMATIQUE);

        when(etudiantRepository.findEtudiantByCredentials_Username("etudiant@example.com"))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.findByEtudiant_Credentials_Username("etudiant@example.com"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.assignStageToStudent(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("L'étudiant n'a pas de CV");
    }

    @Test
    @DisplayName("assignStageToStudent - CV non approuvé")
    void assignStageToStudent_cvNotApproved() {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);

        Etudiant etudiant = new Etudiant("John", "Doe", 
                new Credentials("etudiant@example.com", "password123", Role.ETUDIANT), 
                Discipline.INFORMATIQUE);
        CV cv = CV.builder()
                .id(1L)
                .etudiant(etudiant)
                .status(CvStatus.PENDING)
                .build();

        when(etudiantRepository.findEtudiantByCredentials_Username("etudiant@example.com"))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.findByEtudiant_Credentials_Username("etudiant@example.com"))
                .thenReturn(Optional.of(cv));

        assertThatThrownBy(() -> gestionnaireService.assignStageToStudent(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("L'étudiant doit avoir un CV approuvé");
    }

    @Test
    @DisplayName("assignStageToStudent - Stage non trouvé")
    void assignStageToStudent_stageNotFound() {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);

        Etudiant etudiant = new Etudiant("John", "Doe", 
                new Credentials("etudiant@example.com", "password123", Role.ETUDIANT), 
                Discipline.INFORMATIQUE);
        CV cv = CV.builder()
                .id(1L)
                .etudiant(etudiant)
                .status(CvStatus.APPROVED)
                .build();

        when(etudiantRepository.findEtudiantByCredentials_Username("etudiant@example.com"))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.findByEtudiant_Credentials_Username("etudiant@example.com"))
                .thenReturn(Optional.of(cv));
        when(stageRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gestionnaireService.assignStageToStudent(dto))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    @DisplayName("assignStageToStudent - Stage non approuvé")
    void assignStageToStudent_stageNotApproved() {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);

        Etudiant etudiant = new Etudiant("John", "Doe", 
                new Credentials("etudiant@example.com", "password123", Role.ETUDIANT), 
                Discipline.INFORMATIQUE);
        CV cv = CV.builder()
                .id(1L)
                .etudiant(etudiant)
                .status(CvStatus.APPROVED)
                .build();
        Stage stage = Stage.builder()
                .id(1L)
                .title("Stage en développement")
                .status(OfferStatus.SOUMISE)
                .build();

        when(etudiantRepository.findEtudiantByCredentials_Username("etudiant@example.com"))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.findByEtudiant_Credentials_Username("etudiant@example.com"))
                .thenReturn(Optional.of(cv));
        when(stageRepository.findById(1L)).thenReturn(Optional.of(stage));

        assertThatThrownBy(() -> gestionnaireService.assignStageToStudent(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Le stage doit être approuvé");
    }

    @Test
    @DisplayName("assignStageToStudent - Candidature déjà existante")
    void assignStageToStudent_candidatureAlreadyExists() {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);

        Etudiant etudiant = new Etudiant("John", "Doe", 
                new Credentials("etudiant@example.com", "password123", Role.ETUDIANT), 
                Discipline.INFORMATIQUE);
        CV cv = CV.builder()
                .id(1L)
                .etudiant(etudiant)
                .status(CvStatus.APPROVED)
                .build();
        Stage stage = Stage.builder()
                .id(1L)
                .title("Stage en développement")
                .status(OfferStatus.APPROUVEE)
                .build();

        when(etudiantRepository.findEtudiantByCredentials_Username("etudiant@example.com"))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.findByEtudiant_Credentials_Username("etudiant@example.com"))
                .thenReturn(Optional.of(cv));
        when(stageRepository.findById(1L)).thenReturn(Optional.of(stage));
        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id("etudiant@example.com", 1L))
                .thenReturn(true);

        assertThatThrownBy(() -> gestionnaireService.assignStageToStudent(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Une candidature existe déjà");
    }
}