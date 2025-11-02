package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.CandidatureNotFoundException;
import com.AL565.prose.service.exceptions.InvalidCandidatureModificationException;
import com.AL565.prose.security.JwtTokenProvider;
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
    private NotificationRepository notificationRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;

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

        assertThrows(EmailAlreadyExistsException.class, () -> etudiantService.inscrireEtudiant(etudiantDTO));

        verify(etudiantRepository, never()).save(any(Etudiant.class));
    }

    @Test
    void createCandidature_success() throws Exception {
        String email = "jean.dupont@etudiant.ca";
        Long stageId = 1L;

        CandidatureDTO candidatureDTO = CandidatureDTO.builder()
                .stageId(stageId)
                .motivationLetterData("Test motivation letter".getBytes())
                .motivationLetterContentType("application/pdf")
                .build();

        EtudiantDTO etuDto = new EtudiantDTO();
        etuDto.setEmail(email);
        candidatureDTO.setEtudiant(etuDto);

        Etudiant etudiant = createMockEtudiant(email);
        CV cv = createMockCV(etudiant, CvStatus.APPROVED);
        Stage stage = createMockStage(stageId);

        Candidature savedCandidature = createMockCandidature(etudiant, stage, CandidatureStatus.SOUMISE);

        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId))
                .thenReturn(false);
        when(etudiantRepository.findEtudiantByCredentials_Username(email))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.findByEtudiant_Credentials_Username(email))
                .thenReturn(Optional.of(cv));
        when(stageRepository.findById(stageId))
                .thenReturn(Optional.of(stage));
        when(candidatureRepository.save(any(Candidature.class)))
                .thenReturn(savedCandidature);
        when(notificationRepository.save(any()))
                .thenReturn(null);

        etudiantService.createCandidature(candidatureDTO);

        verify(candidatureRepository, times(1)).save(any(Candidature.class));
    }

    @Test
    void createCandidature_alreadyApplied_throwsException() {
        String email = "jean.dupont@etudiant.ca";
        Long stageId = 1L;

        CandidatureDTO candidatureDTO = CandidatureDTO.builder()
                .stageId(stageId)
                .build();

        EtudiantDTO etuDto = new EtudiantDTO();
        etuDto.setEmail(email);
        candidatureDTO.setEtudiant(etuDto);

        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId))
                .thenReturn(true);

        Exception exception = assertThrows(Exception.class, () -> etudiantService.createCandidature(candidatureDTO));

        assertEquals("Vous avez déjà postulé à ce stage", exception.getMessage());
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void createCandidature_cvNotApproved_throwsException() {
        String email = "jean.dupont@etudiant.ca";
        Long stageId = 1L;

        CandidatureDTO candidatureDTO = CandidatureDTO.builder()
                .stageId(stageId)
                .build();

        EtudiantDTO etuDto = new EtudiantDTO();
        etuDto.setEmail(email);
        candidatureDTO.setEtudiant(etuDto);

        Etudiant etudiant = createMockEtudiant(email);
        CV cv = createMockCV(etudiant, CvStatus.PENDING);

        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId))
                .thenReturn(false);
        when(etudiantRepository.findEtudiantByCredentials_Username(email))
                .thenReturn(Optional.of(etudiant));
        when(cvRepository.findByEtudiant_Credentials_Username(email))
                .thenReturn(Optional.of(cv));

        Exception exception = assertThrows(Exception.class, () -> etudiantService.createCandidature(candidatureDTO));

        assertEquals("Le CV n'est pas approuvé", exception.getMessage());
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void createCandidature_nullDTO_throwsException() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> etudiantService.createCandidature(null));

        assertEquals("Les données de candidature sont requises", exception.getMessage());
    }

    @Test
    void createCandidature_invalidMotivationLetterType_throwsException() {
        String email = "jean.dupont@etudiant.ca";
        Long stageId = 1L;

        CandidatureDTO candidatureDTO = CandidatureDTO.builder()
                .stageId(stageId)
                .motivationLetterData("Test".getBytes())
                .motivationLetterContentType("text/plain")
                .build();

        EtudiantDTO etuDto = new EtudiantDTO();
        etuDto.setEmail(email);
        candidatureDTO.setEtudiant(etuDto);

        when(candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId))
                .thenReturn(false);

        Exception exception = assertThrows(Exception.class, () -> etudiantService.createCandidature(candidatureDTO));

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

        Etudiant etudiant = createMockEtudiant(email);
        Employeur employeur = createMockEmployeur("employer@company.com");
        Stage stage = createMockStageWithDetails(1L, "employer@company.com");
        Candidature candidature = createMockCandidature(etudiant, stage, CandidatureStatus.SOUMISE);

        List<Candidature> candidatures = Arrays.asList(candidature);

        when(candidatureRepository.findByEtudiant_Credentials_Username(email))
                .thenReturn(candidatures);
        when(employeurRepository.getEmployeurByCredentials_Username("employer@company.com"))
                .thenReturn(employeur);

        List<EtudiantCandidatureDTO> result = etudiantService.getMesCandidatures(email);

        assertNotNull(result);
        assertEquals(1, result.size());

        EtudiantCandidatureDTO dto = result.getFirst();
        assertEquals("SOUMISE", dto.getStatus());
        assertEquals("Développeur Java", dto.getStage().getTitle());
        assertEquals("Stage en développement Java", dto.getStage().getDescription());
        assertEquals("Tech Solutions Inc.", dto.getStage().getEmployeur().getCompany());
        assertEquals("Jean", dto.getStage().getEmployeur().getFirstName());
        assertEquals("Dupont", dto.getStage().getEmployeur().getLastName());

        verify(candidatureRepository, times(1)).findByEtudiant_Credentials_Username(email);
        verify(employeurRepository, times(1)).getEmployeurByCredentials_Username("employer@company.com");
    }

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

    private Candidature createMockCandidature(Etudiant etudiant, Stage stage, CandidatureStatus status) {
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

    @Test
    void getEtudiantStages_withoutApplications_returnsAllApprovedStages() {
        String token = "Bearer validToken";
        String etudiantEmail = "etudiant@test.com";
        
        Stage stage1 = createMockStageWithDetails(1L, "employeur1@test.com");
        Stage stage2 = createMockStageWithDetails(2L, "employeur2@test.com");
        
        Employeur employeur1 = createMockEmployeur("employeur1@test.com");
        Employeur employeur2 = createMockEmployeur("employeur2@test.com");
        
        when(jwtTokenProvider.getEmailFromJWT("validToken")).thenReturn(etudiantEmail);
        when(stageRepository.findByStatus(OfferStatus.APPROUVEE))
                .thenReturn(Arrays.asList(stage1, stage2));
        when(candidatureRepository.findByEtudiant_Credentials_Username(etudiantEmail))
                .thenReturn(Arrays.asList()); // Aucune candidature
        when(employeurRepository.getEmployeurByCredentials_Username("employeur1@test.com"))
                .thenReturn(employeur1);
        when(employeurRepository.getEmployeurByCredentials_Username("employeur2@test.com"))
                .thenReturn(employeur2);
        
        List<StageDTO> result = etudiantService.getEtudiantStages(token);
        
        assertEquals(2, result.size());
        assertEquals("Développeur Java", result.get(0).getTitle());
        assertEquals("Développeur Java", result.get(1).getTitle());
        verify(jwtTokenProvider).getEmailFromJWT("validToken");
        verify(stageRepository).findByStatus(OfferStatus.APPROUVEE);
        verify(candidatureRepository).findByEtudiant_Credentials_Username(etudiantEmail);
    }

    @Test
    void getEtudiantStages_withExistingApplications_returnsOnlyNonAppliedStages() {
        String token = "Bearer validToken";
        String etudiantEmail = "etudiant@test.com";
        
        Stage stage1 = createMockStageWithDetails(1L, "employeur1@test.com");
        Stage stage2 = createMockStageWithDetails(2L, "employeur2@test.com");
        Stage stage3 = createMockStageWithDetails(3L, "employeur3@test.com");
        
        Etudiant etudiant = createMockEtudiant(etudiantEmail);
        
        Candidature candidature1 = createMockCandidature(etudiant, stage1, CandidatureStatus.SOUMISE);
        
        // Créer des employeurs
        Employeur employeur2 = createMockEmployeur("employeur2@test.com");
        Employeur employeur3 = createMockEmployeur("employeur3@test.com");
        
        // Mock le comportement
        when(jwtTokenProvider.getEmailFromJWT("validToken")).thenReturn(etudiantEmail);
        when(stageRepository.findByStatus(OfferStatus.APPROUVEE))
                .thenReturn(Arrays.asList(stage1, stage2, stage3));
        when(candidatureRepository.findByEtudiant_Credentials_Username(etudiantEmail))
                .thenReturn(Arrays.asList(candidature1)); // Candidature pour stage1
        when(employeurRepository.getEmployeurByCredentials_Username("employeur2@test.com"))
                .thenReturn(employeur2);
        when(employeurRepository.getEmployeurByCredentials_Username("employeur3@test.com"))
                .thenReturn(employeur3);
        
        // Act
        List<StageDTO> result = etudiantService.getEtudiantStages(token);
        
        // Assert
        assertEquals(2, result.size()); // Seulement stage2 et stage3
        assertTrue(result.stream().noneMatch(stage -> stage.getId().equals(1L)));
        assertTrue(result.stream().anyMatch(stage -> stage.getId().equals(2L)));
        assertTrue(result.stream().anyMatch(stage -> stage.getId().equals(3L)));
        verify(jwtTokenProvider).getEmailFromJWT("validToken");
        verify(stageRepository).findByStatus(OfferStatus.APPROUVEE);
        verify(candidatureRepository).findByEtudiant_Credentials_Username(etudiantEmail);
    }

    @Test
    void getEtudiantStages_allStagesApplied_returnsEmptyList() {
        // Arrange
        String token = "Bearer validToken";
        String etudiantEmail = "etudiant@test.com";
        
        // Créer des stages approuvés
        Stage stage1 = createMockStageWithDetails(1L, "employeur1@test.com");
        Stage stage2 = createMockStageWithDetails(2L, "employeur2@test.com");
        
        // Créer un étudiant
        Etudiant etudiant = createMockEtudiant(etudiantEmail);
        
        // Créer des candidatures pour tous les stages
        Candidature candidature1 = createMockCandidature(etudiant, stage1, CandidatureStatus.SOUMISE);
        Candidature candidature2 = createMockCandidature(etudiant, stage2, CandidatureStatus.SOUMISE);
        
        // Mock le comportement
        when(jwtTokenProvider.getEmailFromJWT("validToken")).thenReturn(etudiantEmail);
        when(stageRepository.findByStatus(OfferStatus.APPROUVEE))
                .thenReturn(Arrays.asList(stage1, stage2));
        when(candidatureRepository.findByEtudiant_Credentials_Username(etudiantEmail))
                .thenReturn(Arrays.asList(candidature1, candidature2));
        
        // Act
        List<StageDTO> result = etudiantService.getEtudiantStages(token);
        
        // Assert
        assertEquals(0, result.size());
        verify(jwtTokenProvider).getEmailFromJWT("validToken");
        verify(stageRepository).findByStatus(OfferStatus.APPROUVEE);
        verify(candidatureRepository).findByEtudiant_Credentials_Username(etudiantEmail);
    }

    @Test
    void respondToOffer_acceptOffer_success() throws CandidatureNotFoundException, InvalidCandidatureModificationException {
        String email = "jean.dupont@etudiant.ca";
        Long candidatureId = 1L;

        Etudiant etudiant = createMockEtudiant(email);
        Stage stage = createMockStage(1L);
        Candidature candidature = createMockCandidature(etudiant, stage, CandidatureStatus.ACCEPTEE);
        candidature.setId(candidatureId);

        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(candidatureId)
                .accepted(true)
                .comment("Je suis ravi d'accepter cette offre!")
                .build();

        when(candidatureRepository.findById(candidatureId))
                .thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class)))
                .thenReturn(candidature);

        etudiantService.respondToOffer(email, responseDTO);

        verify(candidatureRepository, times(1)).findById(candidatureId);
        verify(candidatureRepository, times(1)).save(candidature);
        assertEquals(CandidatureStatus.CONFIRMER, candidature.getStatus());
        assertEquals("Je suis ravi d'accepter cette offre!", candidature.getDecision());
        assertNotNull(candidature.getDateDecision());
    }

    @Test
    void respondToOffer_refuseOffer_success() throws CandidatureNotFoundException, InvalidCandidatureModificationException {
        String email = "jean.dupont@etudiant.ca";
        Long candidatureId = 1L;

        Etudiant etudiant = createMockEtudiant(email);
        Stage stage = createMockStage(1L);
        Candidature candidature = createMockCandidature(etudiant, stage, CandidatureStatus.ACCEPTEE);
        candidature.setId(candidatureId);

        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(candidatureId)
                .accepted(false)
                .comment("J'ai accepté une autre offre.")
                .build();

        when(candidatureRepository.findById(candidatureId))
                .thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class)))
                .thenReturn(candidature);

        etudiantService.respondToOffer(email, responseDTO);

        verify(candidatureRepository, times(1)).findById(candidatureId);
        verify(candidatureRepository, times(1)).save(candidature);
        assertEquals(CandidatureStatus.REFUSEE_ETUDIANT, candidature.getStatus());
        assertEquals("J'ai accepté une autre offre.", candidature.getDecision());
        assertNotNull(candidature.getDateDecision());
    }

    @Test
    void respondToOffer_withoutComment_success() throws CandidatureNotFoundException, InvalidCandidatureModificationException {
        String email = "jean.dupont@etudiant.ca";
        Long candidatureId = 1L;

        Etudiant etudiant = createMockEtudiant(email);
        Stage stage = createMockStage(1L);
        Candidature candidature = createMockCandidature(etudiant, stage, CandidatureStatus.ACCEPTEE);
        candidature.setId(candidatureId);

        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(candidatureId)
                .accepted(true)
                .comment(null)
                .build();

        when(candidatureRepository.findById(candidatureId))
                .thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any(Candidature.class)))
                .thenReturn(candidature);

        etudiantService.respondToOffer(email, responseDTO);

        verify(candidatureRepository, times(1)).findById(candidatureId);
        verify(candidatureRepository, times(1)).save(candidature);
        assertEquals(CandidatureStatus.CONFIRMER, candidature.getStatus());
        assertNull(candidature.getDecision());
        assertNotNull(candidature.getDateDecision());
    }

    @Test
    void respondToOffer_candidatureNotFound_throwsException() {
        String email = "jean.dupont@etudiant.ca";
        Long candidatureId = 999L;

        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(candidatureId)
                .accepted(true)
                .build();

        when(candidatureRepository.findById(candidatureId))
                .thenReturn(Optional.empty());

        assertThrows(CandidatureNotFoundException.class,
                () -> etudiantService.respondToOffer(email, responseDTO));

        verify(candidatureRepository, times(1)).findById(candidatureId);
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void respondToOffer_notOwner_throwsException() {
        String email = "jean.dupont@etudiant.ca";
        String otherEmail = "autre.etudiant@etudiant.ca";
        Long candidatureId = 1L;

        Etudiant otherEtudiant = createMockEtudiant(otherEmail);
        Stage stage = createMockStage(1L);
        Candidature candidature = createMockCandidature(otherEtudiant, stage, CandidatureStatus.ACCEPTEE);
        candidature.setId(candidatureId);

        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(candidatureId)
                .accepted(true)
                .build();

        when(candidatureRepository.findById(candidatureId))
                .thenReturn(Optional.of(candidature));

        InvalidCandidatureModificationException exception = assertThrows(
                InvalidCandidatureModificationException.class,
                () -> etudiantService.respondToOffer(email, responseDTO));

        assertEquals("Cette candidature ne vous appartient pas", exception.getMessage());
        verify(candidatureRepository, times(1)).findById(candidatureId);
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void respondToOffer_wrongStatus_throwsException() {
        String email = "jean.dupont@etudiant.ca";
        Long candidatureId = 1L;

        Etudiant etudiant = createMockEtudiant(email);
        Stage stage = createMockStage(1L);
        Candidature candidature = createMockCandidature(etudiant, stage, CandidatureStatus.SOUMISE);
        candidature.setId(candidatureId);

        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(candidatureId)
                .accepted(true)
                .build();

        when(candidatureRepository.findById(candidatureId))
                .thenReturn(Optional.of(candidature));

        InvalidCandidatureModificationException exception = assertThrows(
                InvalidCandidatureModificationException.class,
                () -> etudiantService.respondToOffer(email, responseDTO));

        assertEquals("Vous ne pouvez répondre qu'à une candidature acceptée par l'employeur",
                exception.getMessage());
        verify(candidatureRepository, times(1)).findById(candidatureId);
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }

    @Test
    void respondToOffer_convoqueeStatus_throwsException() {
        String email = "jean.dupont@etudiant.ca";
        Long candidatureId = 1L;

        Etudiant etudiant = createMockEtudiant(email);
        Stage stage = createMockStage(1L);
        Candidature candidature = createMockCandidature(etudiant, stage, CandidatureStatus.CONVOQUEE);
        candidature.setId(candidatureId);

        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(candidatureId)
                .accepted(true)
                .build();

        when(candidatureRepository.findById(candidatureId))
                .thenReturn(Optional.of(candidature));

        InvalidCandidatureModificationException exception = assertThrows(
                InvalidCandidatureModificationException.class,
                () -> etudiantService.respondToOffer(email, responseDTO));

        assertEquals("Vous ne pouvez répondre qu'à une candidature acceptée par l'employeur",
                exception.getMessage());
        verify(candidatureRepository, times(1)).findById(candidatureId);
        verify(candidatureRepository, never()).save(any(Candidature.class));
    }
}
