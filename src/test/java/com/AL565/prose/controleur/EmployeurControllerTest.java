package com.AL565.prose.controleur;

import com.AL565.prose.controller.EmployeurController;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.ProseUserRepository;
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
import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
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
    void createOffer_retourne_201_avec_location_et_corps() throws Exception {
        var dto = StageDTO.builder()
                .title("Stagiaire Java")
                .description("Développer des APIs Spring")
                .requirements("Java, Spring, SQL")
                .skills(List.of("Java", "Spring"))
                .startDate(LocalDate.now().plusDays(7))
                .endDate(LocalDate.now().plusWeeks(12))
                .durationWeeks(12)
                .location("Montréal")
                .workMode("HYBRIDE")
                .compensation("22$/h")
                .build();

        var returned = StageDTO.builder()
                .id(42L)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .requirements(dto.getRequirements())
                .skills(dto.getSkills())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .durationWeeks(dto.getDurationWeeks())
                .location(dto.getLocation())
                .workMode(dto.getWorkMode())
                .compensation(dto.getCompensation())
                .status(OfferStatus.SOUMISE)
                .createdAt(OffsetDateTime.now())
                .build();

        when(employeurService.createStage(any(Employeur.class), any(StageDTO.class)))
                .thenReturn(returned);

        var employeur = new Employeur();
        employeur.setId(7L);
        employeur.setCompany("Entreprise Test");

        var auth = new UsernamePasswordAuthenticationToken(
                employeur, null, List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEUR"))
        );

        var result = mockMvc.perform(
                post("/employeur/offers")
                        .with(csrf())
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
        ).andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(201);
        Assertions.assertThat(result.getResponse().getHeader("Location")).isEqualTo("/employeur/offers/42");
        var body = result.getResponse().getContentAsString();
        Assertions.assertThat(body).contains("\"id\":42");
        Assertions.assertThat(body).contains("\"status\":\"SOUMISE\"");
        Assertions.assertThat(body).contains("\"description\":\"Développer des APIs Spring\"");
    }

}