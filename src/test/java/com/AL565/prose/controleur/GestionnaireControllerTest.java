package com.AL565.prose.controleur;

import com.AL565.prose.controller.GestionnaireController;
import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.security.exceptions.CvExceptions;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.GestionnaireService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
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

    @Autowired
    ObjectMapper objectMapper;

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
    @WithMockUser(roles = {"GESTIONNAIRE"})
    void approveCv_shouldReturnError_whenException() throws Exception {
        doThrow(new CvExceptions.FailedToChangeCvStatusException())
                .when(gestionnaireService).changeCvStatus(99L, "ewww", "non");

        String body = "{\"id\":99,\"status\":\"ewww\",\"comment\":\"non\"}";
        mockMvc.perform(post("/gestionnaire/cv/change-status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
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
}
