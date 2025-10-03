package com.AL565.prose.controleur;

import com.AL565.prose.controller.EmployeurController;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.dto.EmployeurEnregistrerDTO;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.dto.StageDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;

import static java.lang.reflect.Array.get;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@WebMvcTest(EmployeurController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Import(EmployeurControllerTest.TestSecurityResolvers.class)
class EmployeurControllerTest {

    @TestConfiguration
    static class TestSecurityResolvers {
        @Bean
        AuthenticationPrincipalArgumentResolver authenticationPrincipalArgumentResolver() {
            return new AuthenticationPrincipalArgumentResolver();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EmployeurService employeurService;

    @MockitoBean
    private EmployeurRepository employeurRepository;

    @MockitoBean
    private ProseUserRepository proseUserRepository;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void enregistrer() throws Exception {
        EmployeurEnregistrerDTO mark = new EmployeurEnregistrerDTO("Mark", "Carney", "Gouvernement du Canada", "mc@gov.ca", "gouvernement");

        String content = new ObjectMapper().writeValueAsString(mark);
        MvcResult result = mockMvc.perform(post("/employeur/register").contentType(MediaType.APPLICATION_JSON).content(content).with(csrf())).andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(201);

    }


    @Test
    void createOffer_retourne_201_sans_location_avec_message() throws Exception {
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

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(201);

        Assertions.assertThat(result.getResponse().getHeader("Location")).isNull();

        var body = result.getResponse().getContentAsString();
        Assertions.assertThat(body).isEqualTo("Stage créé avec succès");

        verify(employeurService).createStage(any(StageDTO.class));
    }


    @Test
    void listPublishedByEmployerEmail_ok_200_quandStagesTrouves() throws Exception {
        String email = "boss@zac-inc.com";

        var s1 = StageDTO.builder().id(10L).title("Stage A").build();
        var s2 = StageDTO.builder().id(11L).title("Stage B").build();

        when(employeurService.listStagesFor(email)).thenReturn(List.of(s1, s2));

        MvcResult result = mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/employeur/{email}/stages", email)
                        .accept(MediaType.APPLICATION_JSON)
        ).andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(200);
        String body = result.getResponse().getContentAsString();
        Assertions.assertThat(body).contains("Trouvés");
        Assertions.assertThat(body).contains("Stage A");
        Assertions.assertThat(body).contains("Stage B");

        verify(employeurService, times(1)).listStagesFor(email);
    }

    @Test
    void listPublishedByEmployerEmail_notFound_404_quandListeVide() throws Exception {
        String email = "vide@zac-inc.com";
        when(employeurService.listStagesFor(email)).thenReturn(List.of());

        MvcResult result = mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/employeur/{email}/stages", email)
                        .accept(MediaType.APPLICATION_JSON)
        ).andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(404);
        String body = result.getResponse().getContentAsString();
        Assertions.assertThat(body).contains("Aucun stage publié trouvé pour cet employeur");
        verify(employeurService, times(1)).listStagesFor(email);
    }

    @Test
    void listPublishedByEmployerEmail_unauthorized_401_quandPasEmployeur() throws Exception {
        String email = "x@zac-inc.com";
        when(employeurService.listStagesFor(email)).thenThrow(new UserNotFoundException());

        MvcResult result = mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/employeur/{email}/stages", email)
                        .accept(MediaType.APPLICATION_JSON)
        ).andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(401);
        String body = result.getResponse().getContentAsString();
        Assertions.assertThat(body).contains("Utilisateur n'est pas un employeur");
        verify(employeurService, times(1)).listStagesFor(email);
    }

    @Test
    void listPublishedByEmployerEmail_badRequest_400_surExceptionGenerale() throws Exception {
        String email = "boom@zac-inc.com";
        when(employeurService.listStagesFor(email)).thenThrow(new RuntimeException("boom"));

        MvcResult result = mockMvc.perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/employeur/{email}/stages", email)
                        .accept(MediaType.APPLICATION_JSON)
        ).andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(400);
        String body = result.getResponse().getContentAsString();
        Assertions.assertThat(body).contains("Erreur lors de la récupération des stages publiés");
        verify(employeurService, times(1)).listStagesFor(email);
    }

}