package com.AL565.prose.controleur;

import com.AL565.prose.controller.GestionnaireController;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.EmployeurDTO;
import com.AL565.prose.service.dto.RejectionRequestDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

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

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void getStagesSoumises_returnsStages() throws Exception {
        // Arrange
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

        // Act
        MvcResult result = mockMvc.perform(get("/gestionnaire/stages/status/SOUMISE")
                .with(csrf()))
                .andReturn();

        // Assert
        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String content = result.getResponse().getContentAsString();
        Assertions.assertThat(content).contains("Liste des stages soumises");
        Assertions.assertThat(content).contains("Stage Java");
        Assertions.assertThat(content).contains("Stage Python");
        Assertions.assertThat(content).contains("Entreprise Test");
        Assertions.assertThat(content).contains("Autre Entreprise");
    }

    @Test
    void approuverStage_success() throws Exception {
        // Arrange
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

        // Act
        MvcResult result = mockMvc.perform(put("/gestionnaire/stages/1/approuver")
                .with(csrf()))
                .andReturn();

        // Assert
        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String content = result.getResponse().getContentAsString();
        Assertions.assertThat(content).contains("Stage approuvé avec succès");
        Assertions.assertThat(content).contains("APPROUVEE");
    }

    @Test
    void rejeterStage_success() throws Exception {
        // Arrange
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

        // Act
        MvcResult result = mockMvc.perform(put("/gestionnaire/stages/1/rejeter")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rejectionRequest)))
                .andReturn();

        // Assert
        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String content = result.getResponse().getContentAsString();
        Assertions.assertThat(content).contains("Stage rejeté avec succès");
        Assertions.assertThat(content).contains("REJETEE");
    }

    @Test
    void rejeterStage_badRequest() throws Exception {
        // Arrange
        RejectionRequestDTO emptyRequest = new RejectionRequestDTO("");
        when(gestionnaireService.rejeterStage(anyLong(), anyString()))
                .thenThrow(new IllegalArgumentException("La raison du rejet est obligatoire"));

        // Act
        MvcResult result = mockMvc.perform(put("/gestionnaire/stages/1/rejeter")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyRequest)))
                .andReturn();

        // Assert
        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(400);
    }

}