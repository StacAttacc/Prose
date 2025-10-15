package com.AL565.prose.controleur;

import com.AL565.prose.controller.GestionnaireController;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.CvStatus;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.StageNotification;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.GestionnaireService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.assertj.core.api.Assertions;
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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
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
    private EmployeurService employeurService;

    @MockitoBean
    private EtudiantService etudiantService;

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

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String content = result.getResponse().getContentAsString();
        Assertions.assertThat(content).contains("Liste des stages SOUMISE");
        Assertions.assertThat(content).contains("Stage Java");
        Assertions.assertThat(content).contains("Stage Python");
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

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String content = result.getResponse().getContentAsString();
        Assertions.assertThat(content).contains("Stage approuvé avec succès");
        Assertions.assertThat(content).contains("APPROUVEE");
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

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String content = result.getResponse().getContentAsString();
        Assertions.assertThat(content).contains("Stage rejeté avec succès");
        Assertions.assertThat(content).contains("REJETEE");
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

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(400);
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
    @DisplayName("GET /gestionnaire/notifications/all -> 200 + list of notifications")
    void getStageNotifications_returnsOkWithList() throws Exception {
        StageNotification n1 = new StageNotification();
        n1.setType(NotificationType.STAGE_NOTIFICATION);
        n1.setMessage("Stage submitted");
        n1.setCreatedAt(LocalDateTime.now());
        n1.setSenderEmail("employer1@example.com");
        n1.setStage(null);

        StageNotification n2 = new StageNotification();
        n2.setType(NotificationType.STAGE_NOTIFICATION);
        n2.setMessage("Stage updated");
        n2.setCreatedAt(LocalDateTime.now());
        n2.setSenderEmail("employer2@example.com");
        n2.setStage(null);

        when(gestionnaireService.getStageNotifications()).thenReturn(StageNotificationDTO.builder().stageNotifications(List.of(n1, n2)).count(2).build());

        mockMvc.perform(get("/gestionnaire/notifications/all").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /gestionnaire/notifications/all -> 500 when service throws")
    void getAllNotifications_whenServiceThrows_returns500() throws Exception {
        when(gestionnaireService.getStageNotifications()).thenThrow(new NotificationExceptions.NotificationFetchException());

        mockMvc.perform(get("/gestionnaire/notifications/all").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

}
