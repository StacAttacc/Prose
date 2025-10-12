package com.AL565.prose.controleur;

import com.AL565.prose.controller.EtudiantController;
import com.AL565.prose.model.Discipline;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.EmployeurDTO;
import com.AL565.prose.service.dto.EtudiantCvDTO;
import com.AL565.prose.service.dto.EtudiantDTO;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.PostulerDTO;
import com.AL565.prose.service.dto.StageDTO;
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

import java.time.LocalDateTime;

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

    @Test
    void postuler_success() throws Exception {
        PostulerDTO postulerDTO = createTestPostulerDTO();

        String content = new ObjectMapper().writeValueAsString(postulerDTO);
        MvcResult result = mockMvc.perform(post("/etudiant/postuler")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content)
                .with(csrf()))
                .andReturn();
        
        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(201);
        Assertions.assertThat(result.getResponse().getContentAsString()).isEqualTo("Postulation réussie");
    }

    private PostulerDTO createTestPostulerDTO() {
            // Créer un EtudiantDTO
        EtudiantDTO etudiantDTO = new EtudiantDTO();
        etudiantDTO.setId(1L);
        etudiantDTO.setFirstName("Jean");
        etudiantDTO.setLastName("Dupont");
        etudiantDTO.setEmail("jean.dupont@etudiant.ca");
        etudiantDTO.setDiscipline(Discipline.INFORMATIQUE);
        
        // Créer un StageDTO
        StageDTO stageDTO = new StageDTO();
        stageDTO.setId(1L);
        stageDTO.setTitle("Développeur Full Stack");
        stageDTO.setDescription("Stage en développement web");
        stageDTO.setStatus(OfferStatus.APPROUVEE);
        stageDTO.setLocation("Montréal");
        stageDTO.setCompensation("20$/h");
        
        // Créer un EmployeurDTO pour le stage
        EmployeurDTO employeurDTO = new EmployeurDTO();
        employeurDTO.setId(1L);
        employeurDTO.setCompany("TechCorp");
        employeurDTO.setEmail("recrutement@techcorp.com");
        stageDTO.setEmployeur(employeurDTO);
        
        // Créer un EtudiantCvDTO
        EtudiantCvDTO cvDTO = new EtudiantCvDTO();
        cvDTO.setName("cv_jean_dupont.pdf");
        cvDTO.setType("application/pdf");
        cvDTO.setSize(1024L);
        cvDTO.setStatus("APPROUVEE");
        cvDTO.setData("base64EncodedData"); // Données CV en Base64
        
        // Créer le PostulerDTO
        PostulerDTO postulerDTO = new PostulerDTO();
        postulerDTO.setEtudiant(etudiantDTO);
        postulerDTO.setStage(stageDTO);
        postulerDTO.setCv(cvDTO);
        postulerDTO.setMotivationLetter("base64EncodedMotivationLetter"); // Lettre de motivation en Base64
        postulerDTO.setComment("Je suis très intéressé par ce stage car il correspond parfaitement à mes compétences.");
        postulerDTO.setDatePostulation(null);
        postulerDTO.setStatus(OfferStatus.SOUMISE);
        
        return postulerDTO;
    }
}