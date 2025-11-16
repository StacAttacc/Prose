package com.AL565.prose.controleur;

import com.AL565.prose.controller.EvaluationController;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.*;
import com.AL565.prose.service.dto.EntenteDTO;
import com.AL565.prose.service.dto.EvaluationDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EvaluationController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class EvaluationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EvaluationService evaluationService;

    @MockitoBean private EtudiantService etudiantService;
    @MockitoBean private EmployeurService employeurService;
    @MockitoBean private GestionnaireService gestionnaireService;
    @MockitoBean private ProfesseurService professeurService;
    @MockitoBean private EntenteService ententeService;
    @MockitoBean private JwtTokenProvider jwtTokenProvider;

    private EvaluationDTO evaluationDTO;

    @BeforeEach
    void setUp() {
        evaluationDTO = EvaluationDTO.builder()
                .id(1L)
                .ententeId(5L)
                .employeurId(1L)
                .etudiantId(2L)
                .etudiantNom("Dupont")
                .etudiantPrenom("Jean")
                .employeurNom("Entreprise Test")
                .stageTitle("Stage Développeur Java")
                .productivite(4)
                .qualiteTravail(5)
                .relationsInterpersonnelles(4)
                .habiletesPersonnelles(4)
                .appreciationGlobale(4)
                .commentaires("Très bon stagiaire")
                .pointsForts("Motivé et autonome")
                .pointsAmelioration("Peut améliorer la communication")
                .heureEncadrement("M. Martin")
                .gardeContact(true)
                .rehireEtudiant(true)
                .dateEvaluation(LocalDateTime.now())
                .dateCreation(LocalDateTime.now())
                .build();
    }

    @Test
    void testCreateEvaluation_Success() throws Exception {
        when(evaluationService.createEvaluation(eq(1L), any(EvaluationDTO.class))).thenReturn(evaluationDTO);

        mockMvc.perform(post("/api/employeur/1/evaluations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(evaluationDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.productivite").value(4))
                .andExpect(jsonPath("$.qualiteTravail").value(5))
                .andExpect(jsonPath("$.etudiantNom").value("Dupont"));
    }

    @Test
    void testCreateEvaluation_BadRequest() throws Exception {
        when(evaluationService.createEvaluation(eq(1L), any(EvaluationDTO.class)))
                .thenThrow(new IllegalStateException("Une évaluation existe déjà"));

        mockMvc.perform(post("/api/employeur/1/evaluations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(evaluationDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateEvaluation_Success() throws Exception {
        when(evaluationService.updateEvaluation(eq(1L), eq(1L), any(EvaluationDTO.class))).thenReturn(evaluationDTO);

        mockMvc.perform(put("/api/employeur/1/evaluations/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(evaluationDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void testGetEvaluationByEntente_Success() throws Exception {
        when(evaluationService.getEvaluationByEntente(1L, 5L)).thenReturn(evaluationDTO);

        mockMvc.perform(get("/api/employeur/1/evaluations/entente/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ententeId").value(5));
    }

    @Test
    void testGetEntentesForEvaluation() throws Exception {
        EntenteDTO ententeDTO = new EntenteDTO();
        ententeDTO.setId(5L);
        ententeDTO.setEtudiantNom("Dupont");
        ententeDTO.setHasEvaluation(false);

        when(evaluationService.getEntentesForEvaluation(1L)).thenReturn(java.util.List.of(ententeDTO));

        mockMvc.perform(get("/api/employeur/1/evaluations/ententes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(5))
                .andExpect(jsonPath("$[0].hasEvaluation").value(false));
    }
}