package com.AL565.prose.controleur;

import com.AL565.prose.controller.EmployeurController;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.dto.EmployeurPasswordDTO;
import com.AL565.prose.service.EmployeurService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EmployeurController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class EmployeurControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EmployeurService employeurService;

    @MockitoBean
    private EtudiantService etudiantService;

    @MockitoBean
    private GestionnaireService gestionnaireService;

    @MockitoBean
    private EmployeurRepository employeurRepository;

    @MockitoBean
    private EtudiantRepository etudiantRepository;

    @MockitoBean
    private ProseUserRepository proseUserRepository;

    @MockitoBean
    private StageRepository stageRepository;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void enregistrer() throws Exception {
        Employeur employeur = new Employeur("Mark", "Carney", "Gouvernement du Canada", "mc@gov.ca", "gouvernement");
        EmployeurPasswordDTO mark = new EmployeurPasswordDTO(employeur);

        String content = new ObjectMapper().writeValueAsString(mark);
        MvcResult result = mockMvc.perform(post("/employeur/register").contentType(MediaType.APPLICATION_JSON).content(content).with(csrf())).andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(201);

    }


    @Test
    void createOffer() throws Exception {
        var dto = StageDTO.builder()
                .title("Stagiaire Java")
                .description("Développer des APIs Spring")
                .requirements("Java, Spring, SQL")
                .skills(List.of("Java", "Spring"))
                .startDate(LocalDate.now().plusDays(7))
                .endDate(LocalDate.now().plusWeeks(12))
                .location("Montréal")
                .workMode("HYBRIDE")
                .compensation("22$/h")
                .build();

        when(employeurService.createStage(any(StageDTO.class)))
                .thenReturn(StageDTO.builder().id(42L).build());

        var employeur = new Employeur();
        employeur.setId(7L);
        employeur.setCompany("Entreprise Test");

        var auth = new UsernamePasswordAuthenticationToken(
                employeur, null, List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEUR"))
        );

        var result = mockMvc.perform(
                post("/employeur/createStage")
                        .with(csrf())
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
        ).andReturn();

        assertThat(result.getResponse().getStatus()).isEqualTo(201);

        assertThat(result.getResponse().getHeader("Location")).isNull();

        var body = result.getResponse().getContentAsString();
        assertThat(body).isEqualTo("Stage créé avec succès");

        verify(employeurService).createStage(any(StageDTO.class));
    }

    @Test
    void getCandidatures() throws Exception {
        Stage stage = new Stage(
                1L, "Démissioner", "Partir immédiatement!", "Rien", new ArrayList<>(),
                LocalDate.now(), LocalDate.now(), "Chez vous", null, "Remote", "0$",
                OfferStatus.APPROUVEE, "jemployeur1@gmail.com", OffsetDateTime.now(), OffsetDateTime.now()
        );

        CandidatureDTO candidatureDTO = new CandidatureDTO(
                1L, stage.getId(), null, null, null, 0L, new EtudiantDTO()
        );

        when(employeurService.getStageCandidatures(any(Long.class)))
                .thenReturn(List.of(candidatureDTO));

        MvcResult result = mockMvc.perform(
                        get("/employeur/stages/1/applications").with(csrf())
                )
                .andExpect(status().isOk())
                .andReturn();

        ReturnEntityDTO<List<CandidatureDTO>> candidatures =
                objectMapper.readValue(
                        result.getResponse().getContentAsString(),
                        new TypeReference<ReturnEntityDTO<List<CandidatureDTO>>>() {
                        }
                );

        assertThat(candidatures.getData().size()).isEqualTo(1);
    }

}