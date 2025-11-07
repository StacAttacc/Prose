package com.AL565.prose.controleur;

import com.AL565.prose.controller.GestionnaireController;
import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.notifications.GestionnaireCvNotification;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.PostulationNotification;
import com.AL565.prose.model.notifications.StageNotification;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.EntenteService;
import com.AL565.prose.service.dto.notifications.NotificationGroupDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GestionnaireController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class GestionnaireControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GestionnaireService gestionnaireService;

    @MockitoBean
    private EntenteService ententeService;

    @MockitoBean
    private EmployeurService employeurService;

    @MockitoBean
    private EtudiantService etudiantService;

    @MockitoBean
    private NotificationRepository notificationRepository;

    @MockitoBean
    private PostulationNotificationRepository postulationNotificationRepository;

    @MockitoBean
    private EtudiantCvNotificationRepository etudiantCvNotificationRepository;

    @MockitoBean
    private GestionnaireCvNotificationRepository gestionnaireCvNotificationRepository;

    @MockitoBean
    private CvRepository cvRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    ObjectMapper objectMapper;

    private record CvDecisionStub(Long id, String status, String comment) {}

    @Test
    void getStagesSoumises_returnsStages() throws Exception {
        Employeur employeur1 = new Employeur(1L, "John", "Doe", "Entreprise Test", "john@example.com");
        EmployeurDTO employeurDTO1 = EmployeurDTO.toDTOTokenless(employeur1);

        Employeur employeur2 = new Employeur(2L, "Jane", "Smith", "Autre Entreprise", "jane@example.com");
        EmployeurDTO employeurDTO2 = EmployeurDTO.toDTOTokenless(employeur2);

        StageDTO stage1 = StageDTO.builder()
                .id(1L)
                .title("Stage Java")
                .description("Description du stage")
                .status(OfferStatus.SOUMISE)
                .employeur(employeurDTO1)
                .build();

        StageDTO stage2 = StageDTO.builder()
                .id(2L)
                .title("Stage Python")
                .description("Description du stage Python")
                .status(OfferStatus.SOUMISE)
                .employeur(employeurDTO2)
                .build();

        when(gestionnaireService.getStagesByStatus("SOUMISE")).thenReturn(List.of(stage1, stage2));

        MvcResult result = mockMvc.perform(get("/gestionnaire/stages/status/SOUMISE").with(csrf()))
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String content = result.getResponse().getContentAsString();
        assertThat(content).contains("Liste des stages SOUMISE");
        assertThat(content).contains("Stage Java");
        assertThat(content).contains("Stage Python");
    }

    @Test
    void approuverStage_success() throws Exception {
        Employeur employeur = new Employeur(1L, "John", "Doe", "Entreprise Test", "john@example.com");
        EmployeurDTO employeurDTO = EmployeurDTO.toDTOTokenless(employeur);

        StageDTO stage = StageDTO.builder()
                .id(1L)
                .title("Stage Java")
                .description("Description du stage")
                .status(OfferStatus.APPROUVEE)
                .employeur(employeurDTO)
                .build();

        when(gestionnaireService.approuverStage(1L)).thenReturn(stage);

        MvcResult result = mockMvc.perform(put("/gestionnaire/stages/1/approuver").with(csrf()))
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String content = result.getResponse().getContentAsString();
        assertThat(content).contains("Stage approuvé avec succès");
        assertThat(content).contains("APPROUVEE");
    }

    @Test
    void rejeterStage_success() throws Exception {
        Employeur employeur = new Employeur(1L, "John", "Doe", "Entreprise Test", "john@example.com");
        EmployeurDTO employeurDTO = EmployeurDTO.toDTOTokenless(employeur);

        StageDTO stage = StageDTO.builder()
                .id(1L)
                .title("Stage Java")
                .description("Description du stage")
                .status(OfferStatus.REJETEE)
                .employeur(employeurDTO)
                .build();

        RejectionRequestDTO rejectionRequest = new RejectionRequestDTO("Raison du rejet");

        when(gestionnaireService.rejeterStage(1L, "Raison du rejet")).thenReturn(stage);

        MvcResult result = mockMvc.perform(put("/gestionnaire/stages/1/rejeter")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectionRequest)))
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String content = result.getResponse().getContentAsString();
        assertThat(content).contains("Stage rejeté avec succès");
        assertThat(content).contains("REJETEE");
    }

    @Test
    void rejeterStage_badRequest() throws Exception {
        RejectionRequestDTO emptyRequest = new RejectionRequestDTO("");
        when(gestionnaireService.rejeterStage(anyLong(), anyString()))
                .thenThrow(new IllegalArgumentException("La raison du rejet est obligatoire"));

        MvcResult result = mockMvc.perform(put("/gestionnaire/stages/1/rejeter")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyRequest)))
                .andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(400);
    }

    @Test
    @WithMockUser(roles = {"GESTIONNAIRE"})
    void getAllCvs_shouldReturnOk() throws Exception {
        GestionnaireCvDTO dto = new GestionnaireCvDTO();
        dto.setId(1L);
        dto.setName("CV1");
        dto.setStatus(CvStatus.PENDING.name());
        dto.setEtudiantPrenom("John");
        dto.setEtudiantNom("Doe");
        dto.setEtudiantEmail("john@doe.com");
        dto.setData("data");

        when(gestionnaireService.getAllCvs()).thenReturn(List.of(dto));

        mockMvc.perform(get("/gestionnaire/cv/all").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /gestionnaire/cv/change-status -> 500 with error message when service throws")
    void changeCvStatus_whenServiceThrows_returns500() throws Exception {
        String payload = objectMapper.writeValueAsString(new CvDecisionStub(99L, "INVALID", "no"));
        doThrow(new Exception("boom")).when(gestionnaireService).changeCvStatus(99L, "INVALID", "no");

        mockMvc.perform(post("/gestionnaire/cv/change-status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Erreur lors de la modification du statut du CV")))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("GET /gestionnaire/stages -> 200 + ReturnEntityDTO(message, data[])")
    void getAllStages_returns200WithReturnEntity() throws Exception {
        StageDTO dto1 = StageDTO.builder().id(1L).title("Backend Java").build();
        StageDTO dto2 = StageDTO.builder().id(2L).title("Frontend React").build();

        when(gestionnaireService.getAllStages()).thenReturn(List.of(dto1, dto2));

        mockMvc.perform(get("/gestionnaire/stages").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Liste des stages")))
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @Test
    void getCandidatures() throws Exception {
        EtudiantDTO john = EtudiantDTO.toDTOTokenless(
                new Etudiant("John", "Doe", Credentials.builder().username("email@email.com").password("1234567890").build(), Discipline.INFORMATIQUE)
        );
        EtudiantDTO umberto = EtudiantDTO.toDTOTokenless(
                new Etudiant("Umberto", "Larrios", Credentials.builder().username("email2@email.com").password("1234567890").build(), Discipline.INFORMATIQUE)
        );

        Employeur jean = new Employeur("Jean", "Employeur", "JeanEmployeurs", "jemployeur@gmail.com", "1234567890");

        Stage stage = new Stage();
        stage.setId(1L);
        stage.setTitle("Stage Test");
        stage.setStatus(OfferStatus.SOUMISE);

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setTitle("Stage Test 2");
        stage2.setStatus(OfferStatus.SOUMISE);

        EtudiantCandidaturesDTO candidatureJohn = EtudiantCandidaturesDTO.builder()
                .etudiant(john)
                .candidatures(List.of(
                        EtudiantCandidatureDTO.builder()
                                .stage(StageSimpleDTO.toDTOfromStageDTO(StageDTO.fromModel(stage, jean)))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("En Attente")
                                .build()
                )).build();
        EtudiantCandidaturesDTO candidaturesUmberto = EtudiantCandidaturesDTO.builder()
                .etudiant(umberto)
                .candidatures(List.of(
                        EtudiantCandidatureDTO.builder()
                                .stage(StageSimpleDTO.toDTOfromStageDTO(StageDTO.fromModel(stage, jean)))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("En Attente")
                                .build(),
                        EtudiantCandidatureDTO.builder()
                                .stage(StageSimpleDTO.toDTOfromStageDTO(StageDTO.fromModel(stage2, jean)))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("En Attente")
                                .build()
                )).build();
        when(gestionnaireService.getAllEtudiantsCandidatures()).thenReturn(List.of(candidatureJohn, candidaturesUmberto));

        MvcResult result = mockMvc.perform(get("/gestionnaire/getCandidatures"))
                .andExpect(status().isOk())
                .andReturn();

        ReturnEntityDTO<List<EtudiantCandidaturesDTO>> candidatures = objectMapper.readValue(result.getResponse().getContentAsString(), new TypeReference<>() {
        });

        assertThat(candidatures.getData().size()).isEqualTo(2);
    }

    @Test
    @DisplayName("GET /gestionnaire/notifications/all -> 200 + list of notifications (updated DTO)")
    void getStageNotifications_returnsOkWithList() throws Exception {
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

        NotificationGroupDTO stageGroup = NotificationGroupDTO
                .toDTO(NotificationType.STAGE_NOTIFICATION.getDisplayName(), List.of(n1, n2));
        NotificationGroupDTO postulationGroup = NotificationGroupDTO
                .toDTO(NotificationType.POSTULATION_NOTIFICATION.getDisplayName(), List.of(n3));
        NotificationGroupDTO cvGroup = NotificationGroupDTO
                .toDTO(NotificationType.GESTIONNAIRE_CV_NOTIFICATION.getDisplayName(), List.of(n4));
        NotificationsResponseDTO response = NotificationsResponseDTO.toDTO(List.of(stageGroup, postulationGroup, cvGroup));

        when(gestionnaireService.getGestionnaireNotifications()).thenReturn(response);

        var mvc = mockMvc.perform(get("/gestionnaire/notifications/all").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        String content = mvc.getResponse().getContentAsString();
        assertThat(content).contains("notifications: ");
        assertThat(content).contains("Stage submitted");
    }

    @Test
    @DisplayName("GET /gestionnaire/notifications/all -> 500 when service throws")
    void getAllNotifications_whenServiceThrows_returns500() throws Exception {
        when(gestionnaireService.getGestionnaireNotifications()).thenThrow(new com.AL565.prose.security.exceptions.NotificationExceptions.NotificationFetchException());

        mockMvc.perform(get("/gestionnaire/notifications/all").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void markNotificationAsRead_ByFirstRecipient_success_returnsOk() throws Exception {
        mockMvc.perform(put("/gestionnaire/notifications/read/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void markNotificationAsRead_ByFirstRecipient_whenServiceThrows_returns500WithMessage() throws Exception {
        doThrow(new Exception("boom")).when(gestionnaireService).markNotificationAsRead(anyLong());

        mockMvc.perform(put("/gestionnaire/notifications/read/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Erreur lors du marquage de la notification comme lue")))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void getCandidaturesStatus() throws Exception {
        EtudiantDTO john = EtudiantDTO.toDTOTokenless(
                new Etudiant("John", "Doe", Credentials.builder().username("email@email.com").password("1234567890").build(), Discipline.INFORMATIQUE)
        );
        EtudiantDTO umberto = EtudiantDTO.toDTOTokenless(
                new Etudiant("Umberto", "Larrios", Credentials.builder().username("email2@email.com").password("1234567890").build(), Discipline.INFORMATIQUE)
        );

        Employeur jean = new Employeur("Jean", "Employeur", "JeanEmployeurs", "jemployeur@gmail.com", "1234567890");

        Stage stage = new Stage();
        stage.setId(1L);
        stage.setTitle("Stage Test");
        stage.setStatus(OfferStatus.SOUMISE);

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setTitle("Stage Test 2");
        stage2.setStatus(OfferStatus.SOUMISE);

        EtudiantCandidaturesDTO candidatureJohn = EtudiantCandidaturesDTO.builder()
                .etudiant(john)
                .candidatures(List.of(
                        EtudiantCandidatureDTO.builder()
                                .stage(StageSimpleDTO.toDTOfromStageDTO(StageDTO.fromModel(stage, jean)))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("ACCEPTEE")
                                .build()
                )).build();

        EtudiantCandidaturesDTO candidaturesUmberto = EtudiantCandidaturesDTO.builder()
                .etudiant(umberto)
                .candidatures(List.of(
                        EtudiantCandidatureDTO.builder()
                                .stage(StageSimpleDTO.toDTOfromStageDTO(StageDTO.fromModel(stage, jean)))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("ACCEPTEE")
                                .build(),
                        EtudiantCandidatureDTO.builder()
                                .stage(StageSimpleDTO.toDTOfromStageDTO(StageDTO.fromModel(stage2, jean)))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("REFUSEE")
                                .build()
                )).build();
        when(gestionnaireService.getAllEtudiantsCandidatures()).thenReturn(List.of(candidatureJohn, candidaturesUmberto));

        MvcResult result = mockMvc.perform(get("/gestionnaire/getCandidatures"))
                .andExpect(status().isOk())
                .andReturn();

        ReturnEntityDTO<List<EtudiantCandidaturesDTO>> candidatures = objectMapper.readValue(result.getResponse().getContentAsString(), new TypeReference<>() {
        });

        List<EtudiantCandidaturesDTO> candidaturesList = candidatures.getData();

        List<EtudiantCandidatureDTO> candidaturesJohnDTO = candidaturesList.getFirst().getCandidatures();
        List<EtudiantCandidatureDTO> candidaturesUmbertoDTO = candidaturesList.get(1).getCandidatures();

        assertThat(candidaturesJohnDTO.getFirst().getStatus()).isEqualTo(String.valueOf(CandidatureStatus.ACCEPTEE));
        assertThat(candidaturesUmbertoDTO.getFirst().getStatus()).isEqualTo(String.valueOf(CandidatureStatus.ACCEPTEE));
        assertThat(candidaturesUmbertoDTO.get(1).getStatus()).isEqualTo(String.valueOf(CandidatureStatus.REFUSEE));
    }

    @Test
    @DisplayName("POST /gestionnaire/candidatures/{candidatureId}/generer-entente -> 200 avec EntenteDTO")
    void genererEntente_success() throws Exception {
        Long candidatureId = 1L;
        EntenteDTO ententeDTO = EntenteDTO.builder()
                .id(1L)
                .candidatureId(candidatureId)
                .build();

        when(ententeService.genererEntente(candidatureId)).thenReturn(ententeDTO);

        mockMvc.perform(post("/gestionnaire/candidatures/" + candidatureId + "/generer-entente")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Entente générée avec succès")))
                .andExpect(jsonPath("$.data.id", is(1)));

        verify(ententeService, times(1)).genererEntente(candidatureId);
    }

    @Test
    @DisplayName("POST /gestionnaire/candidatures/{candidatureId}/generer-entente -> 400 avec message d'erreur")
    void genererEntente_whenIllegalArgument_returns400() throws Exception {
        Long candidatureId = 1L;
        String errorMessage = "La candidature doit être confirmée pour générer une entente";

        when(ententeService.genererEntente(candidatureId))
                .thenThrow(new IllegalArgumentException(errorMessage));

        mockMvc.perform(post("/gestionnaire/candidatures/" + candidatureId + "/generer-entente")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is(errorMessage)));

        verify(ententeService, times(1)).genererEntente(candidatureId);
    }

    @Test
    @DisplayName("POST /gestionnaire/candidatures/{candidatureId}/generer-entente -> 500 quand service lance exception")
    void genererEntente_whenServiceThrows_returns500() throws Exception {
        Long candidatureId = 1L;

        when(ententeService.genererEntente(candidatureId))
                .thenThrow(new RuntimeException("Erreur interne"));

        mockMvc.perform(post("/gestionnaire/candidatures/" + candidatureId + "/generer-entente")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Erreur interne du serveur lors de la génération de l'entente")));

        verify(ententeService, times(1)).genererEntente(candidatureId);
    }
}
