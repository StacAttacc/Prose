package com.AL565.prose.service;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Candidature;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.CvStatus;
import com.AL565.prose.model.Stage;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.CandidatureRepository;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.MesCandidaturesDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EtudiantServiceTest {

    @Mock
    private ProseUserRepository proseUserRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private CandidatureRepository candidatureRepository;

    @Mock
    private EmployeurRepository employeurRepository;

    @Mock
    private CvRepository cvRepository;

    @Mock
    private StageRepository stageRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private EtudiantService etudiantService;

    @Test
    void inscrireEtudiant_success() {
        EtudiantPasswordDTO etudiantDTO = new EtudiantPasswordDTO();
        etudiantDTO.setFirstName("Jean");
        etudiantDTO.setLastName("Dupont");
        etudiantDTO.setEmail("jean.dupont@etudiant.ca");
        etudiantDTO.setPassword("motdepasse");
        etudiantDTO.setDiscipline(String.valueOf(Discipline.INFORMATIQUE));

        when(passwordEncoder.encode(anyString())).thenReturn("motdepasseEncode");
        when(proseUserRepository.findByCredentials_Username(anyString())).thenReturn(Optional.empty());

        etudiantService.inscrireEtudiant(etudiantDTO);

        verify(etudiantRepository, times(1)).save(any(Etudiant.class));
    }

    @Test
    void inscrireEtudiant_emailAlreadyExists_throwsException() {
        EtudiantPasswordDTO etudiantDTO = new EtudiantPasswordDTO();
        etudiantDTO.setEmail("existing@etudiant.ca");

        Etudiant existingEtudiant = new Etudiant();
        when(proseUserRepository.findByCredentials_Username(anyString())).thenReturn(Optional.of(existingEtudiant));

        assertThrows(EmailAlreadyExistsException.class, () -> {
            etudiantService.inscrireEtudiant(etudiantDTO);
        });

        verify(etudiantRepository, never()).save(any(Etudiant.class));
    }

    @Test
    void createCandidature_success() throws Exception {
        String email = "jean.dupont@etudiant.ca";
        Long stageId = 1L;

        CandidatureDTO candidatureDTO = CandidatureDTO.builder()
                .etudiantEmail(email)
                .stageId(stageId)
                .motivationLetterData("Test motivation letter".getBytes())
                .motivationLetterContentType("application/pdf")
                .build();

        Etudiant etudiant = createMockEtudiant(email);
        CV cv = createMockCV(etudiant, CvStatus.APPROVED);
        Stage stage = createMockStage(stageId);

        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId))
                .thenReturn(false);
        when(etudiantRepository.findEtudiantByCredentials_Username(email))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.findByEtudiant_Credentials_Username(email))
                .thenReturn(Optional.of(cv));
        when(stageRepository.findById(stageId))
                .thenReturn(Optional.of(stage));

        etudiantService.createCandidature(candidatureDTO);

        verify(candidatureRepository, times(1)).save(any(Candidature.class));
    }

    @Test
    void createCandidature_alreadyApplied_throwsException() {
        String email = "jean.dupont@etudiant.ca";
        Long stageId = 1L;

        CandidatureDTO candidatureDTO = CandidatureDTO.builder()
                .etudiantEmail(email)
                .stageId(stageId)
                .build();

        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId))
                .thenReturn(true);

        Exception exception = assertThrows(Exception.class, () -> {
            etudiantService.createCandidature(candidatureDTO);
        });

        assertEquals("Vous avez déjà postulé à ce stage", exception.getMessage());
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void createCandidature_cvNotApproved_throwsException() {
        String email = "jean.dupont@etudiant.ca";
        Long stageId = 1L;

        CandidatureDTO candidatureDTO = CandidatureDTO.builder()
                .etudiantEmail(email)
                .stageId(stageId)
                .build();

        Etudiant etudiant = createMockEtudiant(email);
        CV cv = createMockCV(etudiant, CvStatus.PENDING);

        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId))
                .thenReturn(false);
        when(etudiantRepository.findEtudiantByCredentials_Username(email))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.findByEtudiant_Credentials_Username(email))
                .thenReturn(Optional.of(cv));

        Exception exception = assertThrows(Exception.class, () -> {
            etudiantService.createCandidature(candidatureDTO);
        });

        assertEquals("Le CV n'est pas approuvé", exception.getMessage());
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void createCandidature_nullDTO_throwsException() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            etudiantService.createCandidature(null);
        });

        assertEquals("Les données de candidature sont requises", exception.getMessage());
    }

    @Test
    void createCandidature_invalidMotivationLetterType_throwsException() {
        String email = "jean.dupont@etudiant.ca";
        Long stageId = 1L;

        CandidatureDTO candidatureDTO = CandidatureDTO.builder()
                .etudiantEmail(email)
                .stageId(stageId)
                .motivationLetterData("Test".getBytes())
                .motivationLetterContentType("text/plain")
                .build();

        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId))
                .thenReturn(false);

        Exception exception = assertThrows(Exception.class, () -> {
            etudiantService.createCandidature(candidatureDTO);
        });

        assertEquals("La lettre de motivation doit être au format PDF", exception.getMessage());
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void hasAlreadyApplied_returnsTrue_whenCandidatureExists() {
        String email = "jean.dupont@etudiant.ca";
        Long stageId = 1L;

        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId))
                .thenReturn(true);

        boolean result = etudiantService.hasAlreadyApplied(email, stageId);

        assertTrue(result);
    }

    @Test
    void hasAlreadyApplied_returnsFalse_whenCandidatureDoesNotExist() {
        String email = "jean.dupont@etudiant.ca";
        Long stageId = 1L;

        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId))
                .thenReturn(false);

        boolean result = etudiantService.hasAlreadyApplied(email, stageId);

        assertFalse(result);
    }

    @Test
    void hasApprovedCv_returnsTrue_whenCvIsApproved() {
        String email = "jean.dupont@etudiant.ca";
        Etudiant etudiant = createMockEtudiant(email);
        CV cv = createMockCV(etudiant, CvStatus.APPROVED);

        when(cvRepository.findByEtudiant_Credentials_Username(email))
                .thenReturn(Optional.of(cv));

        boolean result = etudiantService.hasApprovedCv(email);

        assertTrue(result);
    }

    @Test
    void hasApprovedCv_returnsFalse_whenCvIsNotApproved() {
        String email = "jean.dupont@etudiant.ca";
        Etudiant etudiant = createMockEtudiant(email);
        CV cv = createMockCV(etudiant, CvStatus.PENDING);

        when(cvRepository.findByEtudiant_Credentials_Username(email))
                .thenReturn(Optional.of(cv));

        boolean result = etudiantService.hasApprovedCv(email);

        assertFalse(result);
    }

    @Test
    void hasApprovedCv_returnsFalse_whenCvDoesNotExist() {
        String email = "jean.dupont@etudiant.ca";

        when(cvRepository.findByEtudiant_Credentials_Username(email))
                .thenReturn(Optional.empty());

        boolean result = etudiantService.hasApprovedCv(email);

        assertFalse(result);
    }

    @Test
    void getMesCandidatures_success() {
        String email = "jean.dupont@etudiant.ca";

        // Créer les données de test
        Etudiant etudiant = createMockEtudiant(email);
        Employeur employeur = createMockEmployeur("employer@company.com");
        Stage stage = createMockStageWithDetails(1L, "employer@company.com");
        Candidature candidature = createMockCandidature(etudiant, stage, OfferStatus.SOUMISE);

        List<Candidature> candidatures = Arrays.asList(candidature);

        when(candidatureRepository.findByEtudiant_Credentials_Username(email))
                .thenReturn(candidatures);
        when(employeurRepository.getEmployeurByCredentials_Username("employer@company.com"))
                .thenReturn(employeur);

        // Appeler la méthode
        List<MesCandidaturesDTO> result = etudiantService.getMesCandidatures(email);

        // Vérifications
        assertNotNull(result);
        assertEquals(1, result.size());

        MesCandidaturesDTO dto = result.get(0);
        assertEquals("SOUMISE", dto.getStatus());
        assertEquals("Développeur Java", dto.getStage().getTitle());
        assertEquals("Stage en développement Java", dto.getStage().getDescription());
        assertEquals("Tech Solutions Inc.", dto.getStage().getEmployeur().getCompany());
        assertEquals("Jean", dto.getStage().getEmployeur().getFirstName());
        assertEquals("Dupont", dto.getStage().getEmployeur().getLastName());

        verify(candidatureRepository, times(1)).findByEtudiant_Credentials_Username(email);
        verify(employeurRepository, times(1)).getEmployeurByCredentials_Username("employer@company.com");
    }

    // Méthodes utilitaires pour créer des objets mock
    private Etudiant createMockEtudiant(String email) {
        Etudiant etudiant = new Etudiant();
        etudiant.setId(1L);
        etudiant.setFirstName("Jean");
        etudiant.setLastName("Dupont");
        etudiant.setDiscipline(Discipline.INFORMATIQUE);

        Credentials credentials = new Credentials();
        credentials.setUsername(email);
        credentials.setPassword("encodedPassword");
        credentials.setRole(Role.ETUDIANT);
        etudiant.setCredentials(credentials);

        return etudiant;
    }

    private CV createMockCV(Etudiant etudiant, CvStatus status) {
        CV cv = CV.builder()
                .id(1L)
                .name("cv.pdf")
                .type("application/pdf")
                .size(1024L)
                .data(new byte[]{1, 2, 3})
                .etudiant(etudiant)
                .status(status)
                .build();
        return cv;
    }

    private Stage createMockStage(Long stageId) {
        Stage stage = new Stage();
        stage.setId(stageId);
        stage.setTitle("Développeur Java");
        stage.setDescription("Stage en développement Java");
        stage.setStatus(OfferStatus.APPROUVEE);
        stage.setEmployeurEmail("employer@company.com");
        return stage;
    }

    private Employeur createMockEmployeur(String email) {
        Employeur employeur = new Employeur();
        employeur.setId(1L);
        employeur.setFirstName("Jean");
        employeur.setLastName("Dupont");
        employeur.setCompany("Tech Solutions Inc.");

        Credentials credentials = new Credentials();
        credentials.setUsername(email);
        credentials.setPassword("encodedPassword");
        credentials.setRole(Role.EMPLOYEUR);
        employeur.setCredentials(credentials);

        return employeur;
    }

    private Stage createMockStageWithDetails(Long stageId, String employeurEmail) {
        Stage stage = new Stage();
        stage.setId(stageId);
        stage.setTitle("Développeur Java");
        stage.setDescription("Stage en développement Java");
        stage.setLocation("Montréal, QC");
        stage.setCompensation("25$/h");
        stage.setStartDate(LocalDate.of(2025, 5, 1));
        stage.setEndDate(LocalDate.of(2025, 8, 31));
        stage.setSkills(Arrays.asList("Java", "Spring", "SQL"));
        stage.setStatus(OfferStatus.APPROUVEE);
        stage.setEmployeurEmail(employeurEmail);
        return stage;
    }

    private Candidature createMockCandidature(Etudiant etudiant, Stage stage, OfferStatus status) {
        Candidature candidature = new Candidature();
        candidature.setId(1L);
        candidature.setEtudiant(etudiant);
        candidature.setStage(stage);
        candidature.setStatus(status);
        candidature.setDateCandidature(LocalDateTime.of(2025, 10, 10, 10, 30));
        candidature.setDecision(null);
        candidature.setDateDecision(null);
        return candidature;
    }
}
