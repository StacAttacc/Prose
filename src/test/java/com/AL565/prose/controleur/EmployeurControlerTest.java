package com.AL565.prose.controleur;

import com.AL565.prose.controller.EmployeurControler;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.service.dto.EmployeurEnregistrerDTO;
import com.AL565.prose.service.EmployeurService;
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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@WebMvcTest(EmployeurControler.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EmployeurControlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EmployeurService employeurService;

    @MockitoBean
    private EmployeurRepository employeurRepository;

    @MockitoBean
    private ProseUserRepository proseUserRepository;


    @Test
    void enregistrer() throws Exception {
        EmployeurEnregistrerDTO mark = new EmployeurEnregistrerDTO("Mark", "Carney", "Gouvernement du Canada", "mc@gov.ca", "gouvernement");

        String content = new ObjectMapper().writeValueAsString(mark);
        MvcResult result = mockMvc.perform(post("/employeur/register").contentType(MediaType.APPLICATION_JSON).content(content).with(csrf())).andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(201);

    }
}