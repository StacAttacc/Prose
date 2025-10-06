package com.AL565.prose.controleur;

import com.AL565.prose.controller.GestionnaireController;
import com.AL565.prose.model.CvStatus;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.security.exceptions.CvExceptions;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@WebMvcTest(controllers = GestionnaireController.class)
class GestionnaireControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GestionnaireService gestionnaireService;

    @MockitoBean
    private EmployeurService employeurService;

    @MockitoBean
    private EtudiantService etudiantService;

    @MockitoBean
    private CvRepository cvRepository;

    @Test
    @WithMockUser(roles = {"GESTIONNAIRE"})
    void getAllCvs_shouldReturnOk() throws Exception {
        GestionnaireCvDTO dto = new GestionnaireCvDTO();
        dto.setId(1L);
        dto.setName("CV1");
        dto.setStatus(CvStatus.PENDING.name());
        dto.setEtudiantPrenom("John");
        dto.setEtudiantNom("Doe");
        dto.setEtudiantEmail("john@doe.com");
        dto.setData("data");

        when(gestionnaireService.getAllCvs()).thenReturn(List.of(dto));

        mockMvc.perform(get("/gestionnaire/cv/all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = {"GESTIONNAIRE"})
    void approveCv_shouldReturnOk() throws Exception {
        String body = "{\"id\":1,\"comment\":\"ok\"}";
        mockMvc.perform(post("/gestionnaire/cv/change-status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = {"GESTIONNAIRE"})
    void rejectCv_shouldReturnOk() throws Exception {
        String body = "{\"id\":2,\"comment\":\"not ok\"}";
        mockMvc.perform(post("/gestionnaire/cv/change-status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = {"GESTIONNAIRE"})
    void approveCv_shouldReturnError_whenException() throws Exception {
        doThrow(new CvExceptions.FailedToChangeCvStatusException()).when(gestionnaireService).changeCvStatus(99L,"ewww", "non");

        String body = "{\"id\":99,\"status\": ewww,\"comment\":\"non\"}";
        mockMvc.perform(post("/gestionnaire/cv/change-status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }
}