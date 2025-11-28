package com.AL565.prose.controleur;

import com.AL565.prose.controller.GestionnaireController;
import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import com.AL565.prose.model.notifications.NouveauCvNotification;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.PostulationNotification;
import com.AL565.prose.model.notifications.CreationStageNotification;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.*;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.dto.notifications.NotificationGroupDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EtudiantAlreadyAssociatedException;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private UtilisateurService utilisateurService;

    @MockitoBean
    private EmployeurService employeurService;

    @MockitoBean
    private EtudiantService etudiantService;

    @MockitoBean
    private ProfesseurService professeurService;

    @MockitoBean
    private CvRepository cvRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

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

        when(gestionnaireService.getStagesByStatus("SOUMISE", null)).thenReturn(List.of(stage1, stage2));

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

        when(gestionnaireService.getAllCvs(anyString())).thenReturn(List.of(dto));

        mockMvc.perform(get("/gestionnaire/cv/all").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @ParameterizedTest
    @CsvSource({
            "2077, 2",
            "2078, 1",
            "2025, 0"
    })
    void getAllCvsYearFiltered(String year, String expected) throws Exception {
        GestionnaireCvDTO dto = new GestionnaireCvDTO();
        dto.setId(1L);
        dto.setName("CV1");
        dto.setStatus(CvStatus.PENDING.name());
        dto.setEtudiantPrenom("John");
        dto.setEtudiantNom("Doe");
        dto.setEtudiantEmail("john@doe.com");
        dto.setData("data");

        GestionnaireCvDTO dto2 = new GestionnaireCvDTO();
        dto.setId(2L);
        dto.setName("CV2");
        dto.setStatus(CvStatus.PENDING.name());
        dto.setEtudiantPrenom("Jane");
        dto.setEtudiantNom("Doe");
        dto.setEtudiantEmail("jane@doe.com");
        dto.setData("data");

        GestionnaireCvDTO dto3 = new GestionnaireCvDTO();
        dto.setId(3L);
        dto.setName("CV3");
        dto.setStatus(CvStatus.PENDING.name());
        dto.setEtudiantPrenom("Jane");
        dto.setEtudiantNom("Doe");
        dto.setEtudiantEmail("jane@doe.com");
        dto.setData("data");

        when(gestionnaireService.getAllCvs("2077")).thenReturn(List.of(dto, dto2));
        when(gestionnaireService.getAllCvs("2078")).thenReturn(List.of(dto3));
        when(gestionnaireService.getAllCvs("2025")).thenReturn(new ArrayList<>());

        MvcResult result = mockMvc.perform(get("/gestionnaire/cv/all").param("year", year).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        List<GestionnaireCvDTO> data = objectMapper.readValue(result.getResponse().getContentAsString(), new TypeReference<>() {});

        assertThat(data).hasSize(Integer.parseInt(expected));
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

        when(gestionnaireService.getAllStages(null)).thenReturn(List.of(dto1, dto2));

        mockMvc.perform(get("/gestionnaire/stages").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Liste des stages")))
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @ParameterizedTest
    @CsvSource({
            "2077, 1",
            "2078, 1",
            "2025, 0"
    })
    void getAllStagesDated(String year, String expected) throws Exception {
        StageDTO dto1 = StageDTO.builder().id(1L).title("Backend Java")
                .startDate(LocalDate.of(2077, 1, 18))
                .build();
        StageDTO dto2 = StageDTO.builder().id(2L).title("Frontend React")
                .startDate(LocalDate.of(2078, 1, 18))
                .build();

        when(gestionnaireService.getAllStages("2077")).thenReturn(List.of(dto1));
        when(gestionnaireService.getAllStages("2078")).thenReturn(List.of(dto2));
        when(gestionnaireService.getAllStages("2025")).thenReturn(new ArrayList<>());

        MvcResult result = mockMvc.perform(get("/gestionnaire/stages").param("year", year).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        ReturnEntityDTO<List<StageDTO>> resultString =  objectMapper.readValue(result.getResponse().getContentAsString(), new TypeReference<>() {
        });

        List<StageDTO> data = resultString.getData();

        assertThat(data).hasSize(Integer.parseInt(expected));

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
        stage.setStartDate(LocalDate.now());
        stage.setStatus(OfferStatus.SOUMISE);

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setTitle("Stage Test 2");
        stage.setStartDate(LocalDate.now());
        stage2.setStatus(OfferStatus.SOUMISE);

        EtudiantCandidaturesDTO candidatureJohn = EtudiantCandidaturesDTO.builder()
                .etudiant(john)
                .candidatures(List.of(
                        EtudiantCandidatureDTO.builder()
                                .stage(StageDTO.toDTO(stage, jean))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("En Attente")
                                .build()
                )).build();
        EtudiantCandidaturesDTO candidaturesUmberto = EtudiantCandidaturesDTO.builder()
                .etudiant(umberto)
                .candidatures(List.of(
                        EtudiantCandidatureDTO.builder()
                                .stage(StageDTO.toDTO(stage, jean))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("En Attente")
                                .build(),
                        EtudiantCandidatureDTO.builder()
                                .stage(StageDTO.toDTO(stage2, jean))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("En Attente")
                                .build()
                )).build();
        when(gestionnaireService.getAllEtudiantsCandidatures(nullable(String.class))).thenReturn(List.of(candidatureJohn, candidaturesUmberto));

        MvcResult result = mockMvc.perform(get("/gestionnaire/getCandidatures"))
                .andExpect(status().isOk())
                .andReturn();

        ReturnEntityDTO<List<EtudiantCandidaturesDTO>> candidatures = objectMapper.readValue(result.getResponse().getContentAsString(), new TypeReference<>() {});

        assertThat(candidatures.getData().size()).isEqualTo(2);
    }

    @Test
    @DisplayName("GET /gestionnaire/notifications/all -> 200 + list of notifications (updated DTO)")
    void getStageNotifications_returnsOkWithList() throws Exception {
        CreationStageNotification n1 = new CreationStageNotification();
        n1.setType(NotificationType.CREATION_STAGE_NOTIFICATION);
        n1.setMessageEN("Stage submitted");
        n1.setCreatedAt(LocalDateTime.now());

        CreationStageNotification n2 = new CreationStageNotification();
        n2.setType(NotificationType.CREATION_STAGE_NOTIFICATION);
        n2.setMessageEN("Stage updated");
        n2.setCreatedAt(LocalDateTime.now());

        PostulationNotification n3 = new PostulationNotification();
        n3.setType(NotificationType.POSTULATION_NOTIFICATION);
        n3.setMessageEN("New application");
        n3.setCreatedAt(LocalDateTime.now());

        NouveauCvNotification n4 = new NouveauCvNotification();
        n4.setType(NotificationType.NEW_CV_NOTIFICATION);
        n4.setMessageEN("New CV uploaded");
        n4.setCreatedAt(LocalDateTime.now());

        NotificationGroupDTO stageGroup = NotificationGroupDTO
                .toDTO(NotificationType.CREATION_STAGE_NOTIFICATION.getDisplayName(), List.of(n1, n2));
        NotificationGroupDTO postulationGroup = NotificationGroupDTO
                .toDTO(NotificationType.POSTULATION_NOTIFICATION.getDisplayName(), List.of(n3));
        NotificationGroupDTO cvGroup = NotificationGroupDTO
                .toDTO(NotificationType.NEW_CV_NOTIFICATION.getDisplayName(), List.of(n4));
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
        stage.setStartDate(LocalDate.now());
        stage.setStatus(OfferStatus.SOUMISE);

        Stage stage2 = new Stage();
        stage2.setId(2L);
        stage2.setTitle("Stage Test 2");
        stage2.setStartDate(LocalDate.now());
        stage2.setStatus(OfferStatus.SOUMISE);

        EtudiantCandidaturesDTO candidatureJohn = EtudiantCandidaturesDTO.builder()
                .etudiant(john)
                .candidatures(List.of(
                        EtudiantCandidatureDTO.builder()
                                .stage(StageDTO.toDTO(stage, jean))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("ACCEPTEE")
                                .build()
                )).build();

        EtudiantCandidaturesDTO candidaturesUmberto = EtudiantCandidaturesDTO.builder()
                .etudiant(umberto)
                .candidatures(List.of(
                        EtudiantCandidatureDTO.builder()
                                .stage(StageDTO.toDTO(stage, jean))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("ACCEPTEE")
                                .build(),
                        EtudiantCandidatureDTO.builder()
                                .stage(StageDTO.toDTO(stage2, jean))
                                .dateDecision(LocalDateTime.now())
                                .datePostulation(LocalDateTime.now())
                                .status("REFUSEE")
                                .build()
                )).build();
        when(gestionnaireService.getAllEtudiantsCandidatures(nullable(String.class))).thenReturn(List.of(candidatureJohn, candidaturesUmberto));

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

        when(gestionnaireService.genererEntente(candidatureId)).thenReturn(ententeDTO);

        mockMvc.perform(post("/gestionnaire/candidatures/" + candidatureId + "/generer-entente")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Entente générée avec succès")))
                .andExpect(jsonPath("$.data.id", is(1)));

        verify(gestionnaireService, times(1)).genererEntente(candidatureId);
    }

    @Test
    @DisplayName("POST /gestionnaire/candidatures/{candidatureId}/generer-entente -> 400 avec message d'erreur")
    void genererEntente_whenIllegalArgument_returns400() throws Exception {
        Long candidatureId = 1L;
        String errorMessage = "La candidature doit être confirmée pour générer une entente";

        when(gestionnaireService.genererEntente(candidatureId))
                .thenThrow(new IllegalArgumentException(errorMessage));

        mockMvc.perform(post("/gestionnaire/candidatures/" + candidatureId + "/generer-entente")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is(errorMessage)));

        verify(gestionnaireService, times(1)).genererEntente(candidatureId);
    }

    @Test
    @DisplayName("POST /gestionnaire/candidatures/{candidatureId}/generer-entente -> 500 quand service lance exception")
    void genererEntente_whenServiceThrows_returns500() throws Exception {
        Long candidatureId = 1L;

        when(gestionnaireService.genererEntente(candidatureId))
                .thenThrow(new RuntimeException("Erreur interne"));

        mockMvc.perform(post("/gestionnaire/candidatures/" + candidatureId + "/generer-entente")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Erreur interne du serveur lors de la génération de l'entente")));

        verify(gestionnaireService, times(1)).genererEntente(candidatureId);
    }

    @Test
    void associationProfesseurEtudiant() throws Exception {
        ProfesseurDTO professeurDTO = new ProfesseurDTO();
        professeurDTO.setEmail("robert@brassard.com");
        professeurDTO.setFirstName("Robert");

        EtudiantDTO etudiantDTO = new EtudiantDTO();
        etudiantDTO.setEmail("john@doe.com");
        etudiantDTO.setFirstName("John");

        doNothing().when(gestionnaireService).associateProfesseurToEtudiant(any());

        String content = objectMapper.writeValueAsString(new ProfesseurAssociationDTO(etudiantDTO.getEmail(), professeurDTO.getFirstName()));

        mockMvc.perform(post("/gestionnaire/associate-professeur")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void associationProfesseurEtudiantAlreadyAssociated() throws Exception {
        ProfesseurDTO professeurDTO = new ProfesseurDTO();
        professeurDTO.setEmail("robert@brassard.com");
        professeurDTO.setFirstName("Robert");

        EtudiantDTO etudiantDTO = new EtudiantDTO();
        etudiantDTO.setEmail("john@doe.com");
        etudiantDTO.setFirstName("John");
        etudiantDTO.setProfesseurResponsable(professeurDTO);

        doThrow(EtudiantAlreadyAssociatedException.class).when(gestionnaireService).associateProfesseurToEtudiant(any());

        String content = objectMapper.writeValueAsString(new ProfesseurAssociationDTO(etudiantDTO.getEmail(), professeurDTO.getFirstName()));

        mockMvc.perform(post("/gestionnaire/associate-professeur")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("createProfesseur - Succès")
    void createProfesseur_success() throws Exception {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("Robert");
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline("INFORMATIQUE");

        doNothing().when(gestionnaireService).createProfesseur(any(ProfesseurPasswordDTO.class));

        String content = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/gestionnaire/professeurs/create")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", is("Professeur créé avec succès")));
    }

    @Test
    @DisplayName("createProfesseur - Email déjà existant")
    void createProfesseur_emailAlreadyExists() throws Exception {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("Robert");
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline("INFORMATIQUE");

        doThrow(new EmailAlreadyExistsException("Un compte avec cet email existe déjà"))
                .when(gestionnaireService).createProfesseur(any(ProfesseurPasswordDTO.class));

        String content = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/gestionnaire/professeurs/create")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("Un compte avec cet email existe déjà")));
    }

    @Test
    @DisplayName("createProfesseur - Prénom manquant")
    void createProfesseur_missingFirstName() throws Exception {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName(null);
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline("INFORMATIQUE");

        doThrow(new IllegalArgumentException("Le prénom est requis"))
                .when(gestionnaireService).createProfesseur(any(ProfesseurPasswordDTO.class));

        String content = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/gestionnaire/professeurs/create")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Le prénom est requis")));
    }

    @Test
    @DisplayName("createProfesseur - Discipline invalide")
    void createProfesseur_invalidDiscipline() throws Exception {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("Robert");
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline("INVALID_DISCIPLINE");

        doThrow(new IllegalArgumentException("Discipline invalide"))
                .when(gestionnaireService).createProfesseur(any(ProfesseurPasswordDTO.class));

        String content = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/gestionnaire/professeurs/create")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Discipline invalide")));
    }

    @Test
    @DisplayName("createProfesseur - Erreur serveur")
    void createProfesseur_serverError() throws Exception {
        ProfesseurPasswordDTO dto = new ProfesseurPasswordDTO();
        dto.setFirstName("Robert");
        dto.setLastName("Duval");
        dto.setEmail("robert.duval@example.com");
        dto.setPassword("password123");
        dto.setDiscipline("INFORMATIQUE");

        doThrow(new RuntimeException("Erreur serveur"))
                .when(gestionnaireService).createProfesseur(any(ProfesseurPasswordDTO.class));

        String content = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/gestionnaire/professeurs/create")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message", is("Erreur lors de la création du professeur")));
    }

    @Test
    @DisplayName("assignStageToStudent - Succès")
    void assignStageToStudent_success() throws Exception {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);
        dto.setComment("Stage attribué par le gestionnaire");

        // Créer un CandidatureDTO complet avec toutes les propriétés nécessaires
        Etudiant etudiant = new Etudiant("John", "Doe", 
                new Credentials("etudiant@example.com", "password123", Role.ETUDIANT), 
                Discipline.INFORMATIQUE);
        etudiant.setId(1L);
        
        CandidatureDTO candidatureDTO = CandidatureDTO.builder()
                .id(1L)
                .stageId(1L)
                .status(CandidatureStatus.ACCEPTEE)
                .dateDecision(LocalDateTime.now())
                .etudiant(EtudiantDTO.toDTOTokenless(etudiant))
                .build();

        when(gestionnaireService.assignStageToStudent(any(AssignStageDTO.class)))
                .thenReturn(candidatureDTO);

        String content = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/gestionnaire/stages/assign")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", is("Stage attribué à l'étudiant avec succès")))
                .andExpect(jsonPath("$.data.stageId", is(1)));
    }

    @Test
    @DisplayName("assignStageToStudent - Étudiant non trouvé")
    void assignStageToStudent_studentNotFound() throws Exception {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);

        doThrow(new IllegalArgumentException("Étudiant non trouvé"))
                .when(gestionnaireService).assignStageToStudent(any(AssignStageDTO.class));

        String content = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/gestionnaire/stages/assign")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Étudiant non trouvé")));
    }

    @Test
    @DisplayName("assignStageToStudent - Stage non trouvé")
    void assignStageToStudent_stageNotFound() throws Exception {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);

        doThrow(new java.util.NoSuchElementException("Stage non trouvé"))
                .when(gestionnaireService).assignStageToStudent(any(AssignStageDTO.class));

        String content = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/gestionnaire/stages/assign")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", is("Stage non trouvé")));
    }

    @Test
    @DisplayName("assignStageToStudent - CV non approuvé")
    void assignStageToStudent_cvNotApproved() throws Exception {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);

        doThrow(new IllegalArgumentException("L'étudiant doit avoir un CV approuvé"))
                .when(gestionnaireService).assignStageToStudent(any(AssignStageDTO.class));

        String content = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/gestionnaire/stages/assign")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("L'étudiant doit avoir un CV approuvé")));
    }

    @Test
    @DisplayName("assignStageToStudent - Candidature déjà existante")
    void assignStageToStudent_candidatureAlreadyExists() throws Exception {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);

        doThrow(new IllegalArgumentException("Une candidature existe déjà pour cet étudiant et ce stage"))
                .when(gestionnaireService).assignStageToStudent(any(AssignStageDTO.class));

        String content = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/gestionnaire/stages/assign")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Une candidature existe déjà pour cet étudiant et ce stage")));
    }

    @Test
    @DisplayName("assignStageToStudent - Erreur serveur")
    void assignStageToStudent_serverError() throws Exception {
        AssignStageDTO dto = new AssignStageDTO();
        dto.setEtudiantEmail("etudiant@example.com");
        dto.setStageId(1L);

        doThrow(new RuntimeException("Erreur serveur"))
                .when(gestionnaireService).assignStageToStudent(any(AssignStageDTO.class));

        String content = objectMapper.writeValueAsString(dto);

        mockMvc.perform(post("/gestionnaire/stages/assign")
                        .content(content)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message", is("Erreur lors de l'attribution du stage")));
    }
}
