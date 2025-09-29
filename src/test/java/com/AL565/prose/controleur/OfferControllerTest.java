// src/test/java/com/AL565/prose/controleur/OfferControllerTest.java
package com.AL565.prose.controleur;

import com.AL565.prose.controller.OfferController;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.service.StageService;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.dto.StageEnregistrerDTO;
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

import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@WebMvcTest(OfferController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Import(OfferControllerTest.TestSecurityResolvers.class)
class OfferControllerTest {

    @TestConfiguration
    static class TestSecurityResolvers {
        @Bean
        AuthenticationPrincipalArgumentResolver authenticationPrincipalArgumentResolver() {
            return new AuthenticationPrincipalArgumentResolver();
        }
    }

    @Autowired MockMvc mockMvc;
    @MockitoBean StageService stageService;
    @Autowired ObjectMapper objectMapper;

    @Test
    void createOffer_retourne_201_avec_location_et_corps() throws Exception {
        var dto = new StageEnregistrerDTO();
        dto.setTitle("Stagiaire Java");
        dto.setDescription("Développer des APIs Spring");
        dto.setRequirements("Java, Spring, SQL");
        dto.setDurationWeeks(12);
        dto.setLocation("Montréal");
        dto.setWorkMode("HYBRIDE");
        dto.setCompensation("22$/h");

        var returned = new StageDTO(42L, dto.getTitle(), com.AL565.prose.model.OfferStatus.SOUMISE, OffsetDateTime.now());
        when(stageService.createStage(any(Employeur.class), any(StageEnregistrerDTO.class))).thenReturn(returned);

        var employeur = new Employeur();
        employeur.setId(7L);
        employeur.setCompany("Entreprise Test");

        var auth = new UsernamePasswordAuthenticationToken(
                employeur, null, List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEUR"))
        );

        var result = mockMvc.perform(
                post("/api/offers")
                        .with(csrf())
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
        ).andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(201);
        Assertions.assertThat(result.getResponse().getHeader("Location")).isEqualTo("/api/offers/42");
        Assertions.assertThat(result.getResponse().getContentAsString()).contains("\"id\":42");
        Assertions.assertThat(result.getResponse().getContentAsString()).contains("\"status\":\"SOUMISE\"");
    }
}
