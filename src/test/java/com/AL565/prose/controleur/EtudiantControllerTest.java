package com.AL565.prose.controleur;

import com.AL565.prose.controller.EtudiantController;
import com.AL565.prose.model.Discipline;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@WebMvcTest(EtudiantController.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EtudiantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EtudiantService etudiantService;

    @MockitoBean
    private GestionnaireService gestionnaireService;

    @MockitoBean
    private EtudiantRepository etudiantRepository;

    @MockitoBean
    private ProseUserRepository proseUserRepository;

    @MockitoBean
    private EmployeurService employeurService;

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