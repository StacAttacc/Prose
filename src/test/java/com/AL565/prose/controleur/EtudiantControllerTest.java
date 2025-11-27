package com.AL565.prose.controleur;

import com.AL565.prose.controller.EtudiantController;
import com.AL565.prose.model.Discipline;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.*;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.CandidatureNotFoundException;
import com.AL565.prose.service.exceptions.InvalidCandidatureModificationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EtudiantController.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EtudiantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EtudiantService etudiantService;

    @MockitoBean
    private EmployeurService employeurService;

    @MockitoBean
    private GestionnaireService gestionnaireService;

    @MockitoBean
    private ProfesseurService professeurService;

    @MockitoBean
    private UtilisateurService utilisateurService;

    @MockitoBean
    private EtudiantRepository etudiantRepository;

    @MockitoBean
    private ProseUserRepository proseUserRepository;

    @MockitoBean
    private NotificationRepository notificationRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void inscrireEtudiant_success() throws Exception {
        EtudiantPasswordDTO etudiant = createTestEtudiantDTO();

        String content = new ObjectMapper().writeValueAsString(etudiant);
        MvcResult result = mockMvc.perform(post("/etudiant/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
                .with(csrf()))
                .andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(201);
    }

    @Test
    void inscrireEtudiant_emailAlreadyExists() throws Exception {
        EtudiantPasswordDTO etudiant = createTestEtudiantDTO();
        doThrow(new EmailAlreadyExistsException("Un compte avec cet email existe déjà"))
                .when(etudiantService).inscrireEtudiant(any(EtudiantPasswordDTO.class));

        String content = new ObjectMapper().writeValueAsString(etudiant);
        MvcResult result = mockMvc.perform(post("/etudiant/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
                .with(csrf()))
                .andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(409);
        Assertions.assertThat(result.getResponse().getContentAsString()).isEqualTo("Un compte avec cet email existe déjà");
    }

    @Test
    void inscrireEtudiant_internalError() throws Exception {
        EtudiantPasswordDTO etudiant = createTestEtudiantDTO();
        doThrow(new RuntimeException("Erreur interne"))
                .when(etudiantService).inscrireEtudiant(any(EtudiantPasswordDTO.class));

        String content = new ObjectMapper().writeValueAsString(etudiant);
        MvcResult result = mockMvc.perform(post("/etudiant/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
                .with(csrf()))
                .andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(500);
        Assertions.assertThat(result.getResponse().getContentAsString()).isEqualTo("Erreur lors de l'inscription");
    }

    @Test
    void televerserCv_success() throws Exception {
        MockMultipartFile cvFile = new MockMultipartFile(
                "cv",
                "cv.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "CV content".getBytes()
        );

        doNothing().when(etudiantService).saveCv(any(), anyString(), anyString());

        mockMvc.perform(multipart("/etudiant/televerser-cv")
                .file(cvFile)
                .param("email", "test@test.com")
                .param("lastModified", "2024-01-01")
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(content().string("CV téléversé avec succès"));

        verify(etudiantService, times(1)).saveCv(any(), eq("test@test.com"), eq("2024-01-01"));
    }

    @Test
    void telechargerCv_success() throws Exception {
        EtudiantCvDTO cvDTO = new EtudiantCvDTO();
        cvDTO.setName("cv.pdf");
        cvDTO.setType("application/pdf");

        when(etudiantService.getCvByEmail("test@test.com")).thenReturn(null);

        mockMvc.perform(get("/etudiant/telecharger-cv/test@test.com")
                .with(csrf()))
                .andExpect(status().isOk());

        verify(etudiantService, times(1)).getCvByEmail("test@test.com");
    }

    @Test
    void getEtudiantStages_success() throws Exception {
        List<StageDTO> stages = new ArrayList<>();
        StageDTO stage = new StageDTO();
        stage.setId(1L);
        stage.setTitle("Stage de développement");
        stages.add(stage);

        when(etudiantService.getEtudiantStages(anyString())).thenReturn(stages);

        mockMvc.perform(get("/etudiant/stages/approuves")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Stages approuvés"))
                .andExpect(jsonPath("$.data").isArray());

        verify(etudiantService, times(1)).getEtudiantStages(anyString());
    }

    @Test
    void getEtudiantStages_error() throws Exception {
        when(etudiantService.getEtudiantStages(anyString())).thenThrow(new RuntimeException("Erreur"));

        mockMvc.perform(get("/etudiant/stages/approuves")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Erreur lors de la récupération des stages approuvés"));
    }

    @Test
    void soumettreCandidat_success() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        when(etudiantService.getByEmail("test@test.com")).thenReturn(createTestEtudiantDTOForCandidature());
        doNothing().when(etudiantService).createCandidature(any());

        mockMvc.perform(multipart("/etudiant/candidature")
                .param("stageId", "1")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(content().string("Candidature soumise avec succès"));

        verify(etudiantService, times(1)).createCandidature(any());
    }

    @Test
    void soumettreCandidat_withMotivationLetter_success() throws Exception {
        MockMultipartFile motivationLetter = new MockMultipartFile(
                "motivationLetter",
                "motivation.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "Motivation letter content".getBytes()
        );

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        when(etudiantService.getByEmail("test@test.com")).thenReturn(createTestEtudiantDTOForCandidature());
        doNothing().when(etudiantService).createCandidature(any());

        mockMvc.perform(multipart("/etudiant/candidature")
                .file(motivationLetter)
                .param("stageId", "1")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(content().string("Candidature soumise avec succès"));

        verify(etudiantService, times(1)).createCandidature(any());
    }

    @Test
    void soumettreCandidat_error() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        when(etudiantService.getByEmail("test@test.com")).thenReturn(createTestEtudiantDTOForCandidature());
        doThrow(new Exception("Erreur de candidature")).when(etudiantService).createCandidature(any());

        mockMvc.perform(multipart("/etudiant/candidature")
                .param("stageId", "1")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Erreur interne du serveur."));
    }

    @Test
    void checkIfAlreadyApplied_returnsTrue() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        when(etudiantService.hasAlreadyApplied("test@test.com", 1L)).thenReturn(true);

        mockMvc.perform(get("/etudiant/candidature/check/1")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasApplied").value(true));

        verify(etudiantService, times(1)).hasAlreadyApplied("test@test.com", 1L);
    }

    @Test
    void checkIfAlreadyApplied_returnsFalse() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        when(etudiantService.hasAlreadyApplied("test@test.com", 1L)).thenReturn(false);

        mockMvc.perform(get("/etudiant/candidature/check/1")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasApplied").value(false));

        verify(etudiantService, times(1)).hasAlreadyApplied("test@test.com", 1L);
    }

    @Test
    void checkIfAlreadyApplied_error() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenThrow(new RuntimeException("Erreur JWT"));

        mockMvc.perform(get("/etudiant/candidature/check/1")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.hasApplied").value(false));
    }

    @Test
    void checkCvStatus_cvApproved() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        when(etudiantService.hasApprovedCv("test@test.com")).thenReturn(true);

        mockMvc.perform(get("/etudiant/cv/status")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));

        verify(etudiantService, times(1)).hasApprovedCv("test@test.com");
    }

    @Test
    void checkCvStatus_cvNotApproved() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        when(etudiantService.hasApprovedCv("test@test.com")).thenReturn(false);

        mockMvc.perform(get("/etudiant/cv/status")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));

        verify(etudiantService, times(1)).hasApprovedCv("test@test.com");
    }

    @Test
    void checkCvStatus_error() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenThrow(new RuntimeException("Erreur JWT"));

        mockMvc.perform(get("/etudiant/cv/status")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    void getCvInfo_cvExists() throws Exception {
        EtudiantCvDTO cvDTO = new EtudiantCvDTO();
        cvDTO.setName("cv.pdf");
        cvDTO.setType("application/pdf");

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        when(etudiantService.getCvByEmail("test@test.com")).thenReturn(cvDTO);

        mockMvc.perform(get("/etudiant/cv/info")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("cv.pdf"));

        verify(etudiantService, times(1)).getCvByEmail("test@test.com");
    }

    @Test
    void getCvInfo_cvNotFound() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        when(etudiantService.getCvByEmail("test@test.com")).thenReturn(null);

        mockMvc.perform(get("/etudiant/cv/info")
                        .header("Authorization", "Bearer token123")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string(""));

        verify(etudiantService, times(1)).getCvByEmail("test@test.com");
    }

    @Test
    void getCvInfo_error() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenThrow(new InternalError("Erreur JWT"));

        mockMvc.perform(get("/etudiant/cv/info")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getMesCandidatures_success() throws Exception {
        List<EtudiantCandidatureDTO> candidatures = createTestCandidatures();

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        when(etudiantService.getMesCandidatures("test@test.com")).thenReturn(candidatures);

        mockMvc.perform(get("/etudiant/candidatures")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Candidatures récupérées avec succès"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].status").value("SOUMISE"))
                .andExpect(jsonPath("$.data[0].stage.title").value("Développeur Full Stack"))
                .andExpect(jsonPath("$.data[0].stage.employeur.company").value("Tech Solutions Inc."));

        verify(etudiantService, times(1)).getMesCandidatures("test@test.com");
    }

    // Méthode utilitaire
    private EtudiantPasswordDTO createTestEtudiantDTO() {
        EtudiantPasswordDTO etudiant = new EtudiantPasswordDTO();
        etudiant.setFirstName("Jean");
        etudiant.setLastName("Dupont");
        etudiant.setEmail("jean.dupont@etudiant.ca");
        etudiant.setPassword("motdepasse");
        etudiant.setDiscipline(String.valueOf(Discipline.INFORMATIQUE));
        return etudiant;
    }

    private List<EtudiantCandidatureDTO> createTestCandidatures() {
        List<EtudiantCandidatureDTO> candidatures = new ArrayList<>();

        EmployeurDTO employeur = EmployeurDTO.toDTOTokenless(new Employeur("Jean", "Dupont", "Tech Solutions Inc.", "jean@dupont.com", "1234567890"));

        StageDTO stage = StageDTO.builder()
                .title("Développeur Full Stack")
                .description("Développement d'applications web modernes")
                .location("Montréal, QC")
                .compensation("25$/h")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now())
                .skills(Arrays.asList("React", "Node.js", "MongoDB"))
                .employeur(employeur)
                .build();

        EtudiantCandidatureDTO candidature = EtudiantCandidatureDTO.builder()
                .stage(stage)
                .status("SOUMISE")
                .datePostulation(java.time.LocalDateTime.of(2025, 10, 10, 10, 30))
                .decision(null)
                .dateDecision(null)
                .build();

        candidatures.add(candidature);
        return candidatures;
    }

    private EtudiantDTO createTestEtudiantDTOForCandidature() {
        EtudiantDTO etudiant = new EtudiantDTO();
        etudiant.setId(1L);
        etudiant.setFirstName("Jean");
        etudiant.setLastName("Dupont");
        etudiant.setEmail("test@test.com");
        etudiant.setDiscipline(Discipline.INFORMATIQUE);
        return etudiant;
    }

    @Test
    void getAllNotifications_success() throws Exception {
        NotificationsResponseDTO notifications = new NotificationsResponseDTO();
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        when(etudiantService.getStudentsNotifications("test@test.com")).thenReturn(notifications);

        mockMvc.perform(get("/etudiant/notifications/all")
                        .header("Authorization", "Bearer token123")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("notifications: "))
                .andExpect(jsonPath("$.data").exists());

        verify(etudiantService, times(1)).getStudentsNotifications("test@test.com");
    }

    @Test
    void respondToOffer_acceptOffer_success() throws Exception {
        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(1L)
                .accepted(true)
                .comment("Je suis ravi d'accepter cette offre!")
                .build();

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        doNothing().when(etudiantService).respondToOffer(anyString(), any(EtudiantResponseOfferDTO.class));

        String content = new ObjectMapper().writeValueAsString(responseDTO);

        mockMvc.perform(put("/etudiant/candidatures/respond")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Offre acceptée avec succès"));

        verify(etudiantService, times(1)).respondToOffer(eq("test@test.com"), any(EtudiantResponseOfferDTO.class));
    }

    @Test
    void respondToOffer_refuseOffer_success() throws Exception {
        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(1L)
                .accepted(false)
                .comment("J'ai accepté une autre offre.")
                .build();

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        doNothing().when(etudiantService).respondToOffer(anyString(), any(EtudiantResponseOfferDTO.class));

        String content = new ObjectMapper().writeValueAsString(responseDTO);

        mockMvc.perform(put("/etudiant/candidatures/respond")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Offre refusée avec succès"));

        verify(etudiantService, times(1)).respondToOffer(eq("test@test.com"), any(EtudiantResponseOfferDTO.class));
    }

    @Test
    void respondToOffer_candidatureNotFound() throws Exception {
        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(999L)
                .accepted(true)
                .build();

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        doThrow(new CandidatureNotFoundException("Candidature non trouvée"))
                .when(etudiantService).respondToOffer(anyString(), any(EtudiantResponseOfferDTO.class));

        String content = new ObjectMapper().writeValueAsString(responseDTO);

        mockMvc.perform(put("/etudiant/candidatures/respond")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
                .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Candidature non trouvée"));

        verify(etudiantService, times(1)).respondToOffer(eq("test@test.com"), any(EtudiantResponseOfferDTO.class));
    }

    @Test
    void respondToOffer_invalidModification_wrongStatus() throws Exception {
        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(1L)
                .accepted(true)
                .build();

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        doThrow(new InvalidCandidatureModificationException("Vous ne pouvez répondre qu'à une candidature acceptée par l'employeur"))
                .when(etudiantService).respondToOffer(anyString(), any(EtudiantResponseOfferDTO.class));

        String content = new ObjectMapper().writeValueAsString(responseDTO);

        mockMvc.perform(put("/etudiant/candidatures/respond")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
                .with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Vous ne pouvez répondre qu'à une candidature acceptée par l'employeur"));

        verify(etudiantService, times(1)).respondToOffer(eq("test@test.com"), any(EtudiantResponseOfferDTO.class));
    }

    @Test
    void respondToOffer_invalidModification_notOwner() throws Exception {
        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(1L)
                .accepted(true)
                .build();

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        doThrow(new InvalidCandidatureModificationException("Cette candidature ne vous appartient pas"))
                .when(etudiantService).respondToOffer(anyString(), any(EtudiantResponseOfferDTO.class));

        String content = new ObjectMapper().writeValueAsString(responseDTO);

        mockMvc.perform(put("/etudiant/candidatures/respond")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
                .with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Cette candidature ne vous appartient pas"));

        verify(etudiantService, times(1)).respondToOffer(eq("test@test.com"), any(EtudiantResponseOfferDTO.class));
    }

    @Test
    void respondToOffer_internalServerError() throws Exception {
        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(1L)
                .accepted(true)
                .build();

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        doThrow(new RuntimeException("Erreur inattendue"))
                .when(etudiantService).respondToOffer(anyString(), any(EtudiantResponseOfferDTO.class));

        String content = new ObjectMapper().writeValueAsString(responseDTO);

        mockMvc.perform(put("/etudiant/candidatures/respond")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
                .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Erreur lors de la réponse à l'offre"));

        verify(etudiantService, times(1)).respondToOffer(eq("test@test.com"), any(EtudiantResponseOfferDTO.class));
    }

    @Test
    void respondToOffer_withoutComment_success() throws Exception {
        EtudiantResponseOfferDTO responseDTO = EtudiantResponseOfferDTO.builder()
                .candidatureId(1L)
                .accepted(true)
                .comment(null)
                .build();

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
        doNothing().when(etudiantService).respondToOffer(anyString(), any(EtudiantResponseOfferDTO.class));

        String content = new ObjectMapper().writeValueAsString(responseDTO);

        mockMvc.perform(put("/etudiant/candidatures/respond")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Offre acceptée avec succès"));

        verify(etudiantService, times(1)).respondToOffer(eq("test@test.com"), any(EtudiantResponseOfferDTO.class));
    }

    @Test
    void signEntente_success() throws Exception {
        Long ententeId = 1L;
        String token = "Bearer token123";
        String email = "etudiant@test.com";

        when(jwtTokenProvider.getEmailFromJWT("token123")).thenReturn(email);
        doNothing().when(utilisateurService).signEntente(ententeId, email);

        mockMvc.perform(put("/etudiant/ententes/" + ententeId + "/signer")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Entente signée avec succès"));

        verify(utilisateurService, times(1)).signEntente(ententeId, email);
    }

    @Test
    void signEntente_whenServiceThrows_returns500() throws Exception {
        Long ententeId = 1L;
        String token = "Bearer token123";
        String email = "etudiant@test.com";

        when(jwtTokenProvider.getEmailFromJWT("token123")).thenReturn(email);
        doThrow(new RuntimeException("Erreur lors de la signature"))
                .when(utilisateurService).signEntente(ententeId, email);

        mockMvc.perform(put("/etudiant/ententes/" + ententeId + "/signer")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Erreur interne du serveur lors de la signature de l'entente"));

        verify(utilisateurService, times(1)).signEntente(ententeId, email);
    }
}