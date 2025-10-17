package com.AL565.prose.controleur;

import com.AL565.prose.controller.EtudiantController;
import com.AL565.prose.model.Discipline;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.EtudiantCvDTO;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

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
    private EtudiantRepository etudiantRepository;

    @MockitoBean
    private ProseUserRepository proseUserRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    // Tests pour /register
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

    // Tests pour /televerser-cv
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

    // Tests pour /telecharger-cv/{email}
    @Test
    void telechargerCv_success() throws Exception {
        EtudiantCvDTO cvDTO = new EtudiantCvDTO();
        cvDTO.setName("cv.pdf");
        cvDTO.setType("application/pdf");

        when(etudiantService.getCvByEmail("test@test.com")).thenReturn(Optional.of(cvDTO));

        mockMvc.perform(get("/etudiant/telecharger-cv/test@test.com")
                .with(csrf()))
                .andExpect(status().isOk());

        verify(etudiantService, times(1)).getCvByEmail("test@test.com");
    }

    // Tests pour /stages/approuves
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

    // Tests pour /candidature
    @Test
    void soumettreCandidat_success() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenReturn("test@test.com");
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
        doThrow(new Exception("Erreur de candidature")).when(etudiantService).createCandidature(any());

        mockMvc.perform(multipart("/etudiant/candidature")
                .param("stageId", "1")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Erreur lors de la soumission de la candidature: Erreur de candidature"));
    }

    // Tests pour /candidature/check/{stageId}
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
        when(etudiantService.getCvByEmail("test@test.com")).thenReturn(Optional.of(cvDTO));

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
        when(etudiantService.getCvByEmail("test@test.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/etudiant/cv/info")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(etudiantService, times(1)).getCvByEmail("test@test.com");
    }

    @Test
    void getCvInfo_error() throws Exception {
        when(jwtTokenProvider.getEmailFromJWT(anyString())).thenThrow(new RuntimeException("Erreur JWT"));

        mockMvc.perform(get("/etudiant/cv/info")
                .header("Authorization", "Bearer token123")
                .with(csrf()))
                .andExpect(status().isInternalServerError());
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
}