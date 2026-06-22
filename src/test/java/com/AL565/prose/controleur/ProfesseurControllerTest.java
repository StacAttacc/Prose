package com.AL565.prose.controleur;

import com.AL565.prose.controller.ProfesseurController;
import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.*;
import com.AL565.prose.service.dto.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@WebMvcTest(ProfesseurController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class ProfesseurControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProfesseurService professeurService;

    @MockitoBean
    private EmployeurService employeurService;

    @MockitoBean
    private EtudiantService etudiantService;

    @MockitoBean
    private GestionnaireService gestionnaireService;

    @MockitoBean
    private UtilisateurService authService;

    @MockitoBean
    private UtilisateurService utilisateurService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void testEvaluateMillieu() throws Exception {
        MillieuEvaluationDTO evaluationDTO = new MillieuEvaluationDTO();
        evaluationDTO.setCommentaires("Beau stage!");

        String content = objectMapper.writeValueAsString(evaluationDTO);

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("prof@test.com");
        doNothing().when(professeurService).evaluateWorkplace(eq(evaluationDTO), eq(evaluationDTO.getCandidatureId()), eq("prof@test.com"));

        mockMvc.perform(post("/professeur/evaluate")
                .header("Authorization", "Bearer token123")
                .contentType(MediaType.APPLICATION_JSON).content(content))
                .andExpect(status().isOk());
    }

    @ParameterizedTest
    @CsvSource({
            "2025, 2, 1",
            "2026, 1, 1"
    })
    void getAllCandidaturesProfesseur(String year, String expected, String professeurId) throws Exception {
        StageDTO stage = new StageDTO();
        stage.setId(1L);
        stage.setStartDate(LocalDate.now());

        StageDTO stage2 = new StageDTO();
        stage2.setId(2L);
        stage2.setStartDate(LocalDate.of(2026, 2, 12));

        CandidatureEvaluationDTO candidature1 = new CandidatureEvaluationDTO();
        candidature1.setId(1L);
        candidature1.setStage(new StageDTO());
        candidature1.setEvaluationMillieu(new MillieuEvaluationDTO());
        candidature1.setEtudiant(EtudiantDTO.toDTOTokenless(new Etudiant("John", "Doe", new Credentials("john@doe.com", "123", Role.ETUDIANT), Discipline.INFORMATIQUE)));

        CandidatureEvaluationDTO candidature2 = new CandidatureEvaluationDTO();
        candidature2.setId(2L);
        candidature2.setStage(new StageDTO());
        candidature2.setEtudiant(EtudiantDTO.toDTOTokenless(new Etudiant("John", "Doe", new Credentials("john@doe.com", "123", Role.ETUDIANT), Discipline.INFORMATIQUE)));

        CandidatureEvaluationDTO candidature3 = new CandidatureEvaluationDTO();
        candidature3.setId(3L);
        candidature3.setStage(new StageDTO());
        candidature3.setEvaluationMillieu(new MillieuEvaluationDTO());
        candidature3.setEtudiant(EtudiantDTO.toDTOTokenless(new Etudiant("John", "Doe", new Credentials("john@doe.com", "123", Role.ETUDIANT), Discipline.INFORMATIQUE)));

        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("prof@test.com");

        when(professeurService.getAllCandidaturesProfesseurRelated(eq("2025"), anyString(), anyString())).thenReturn(
                List.of(candidature1, candidature2)
        );

        when(professeurService.getAllCandidaturesProfesseurRelated(eq("2026"), anyString(), anyString())).thenReturn(
                List.of(candidature3)
        );

        MvcResult result = mockMvc.perform(get("/professeur/" + professeurId + "/mes-etudiants-candidatures")
                        .header("Authorization", "Bearer token123")
                        .param("year", year))
                .andExpect(status().isOk())
                .andReturn();

        ReturnEntityDTO<List<CandidatureEvaluationDTO>> returnEntityDTO = objectMapper.readValue(result.getResponse().getContentAsString(), new TypeReference<>() {});
        List<CandidatureEvaluationDTO> data =  returnEntityDTO.getData();

        assertThat(data.size()).isEqualTo(Integer.parseInt(expected));
    }
}
