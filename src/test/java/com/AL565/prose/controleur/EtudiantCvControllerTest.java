package com.AL565.prose.controleur;

import com.AL565.prose.controller.EtudiantController;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.EtudiantCvDTO;
import com.AL565.prose.model.CV;
import com.AL565.prose.repository.CvRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import java.util.Base64;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@WebMvcTest(controllers = EtudiantController.class)
class EtudiantCvControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CvRepository cvRepository;

    @MockitoBean
    private EtudiantService etudiantInscriptionService;

    @MockitoBean
    private EmployeurService employeurService;

    @MockitoBean
    private GestionnaireService gestionnaireService;

    @Autowired
    private EtudiantService etudiantService;

    @Test
    @WithMockUser(username = "testuser", roles = {"ETUDIANT"})
    void televerserCv_shouldReturnCreatedForAuthenticatedUser() throws Exception {
        mockMvc.perform(multipart("/etudiant/televerser-cv")
                        .file("cv", "PDF content".getBytes())
                        .param("email", "email@email.email")
                        .param("lastModified", "2024-10-01T12:00:00Z")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .with(csrf()))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "testuser", roles = {"ETUDIANT"})
    void telechargerCv_shouldReturnOkForAuthenticatedUser() throws Exception {
        MockMultipartFile pdfFile = new MockMultipartFile(
                "cv",
                "sample.pdf",
                "application/pdf",
                "%PDF-1.4\n%Mock PDF content\n".getBytes()
        );

        mockMvc.perform(multipart("/etudiant/televerser-cv")
                        .file(pdfFile)
                        .param("email", "email@email.email")
                        .param("lastModified", "2024-10-01T12:00:00Z")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .with(csrf()))
                .andExpect(status().isCreated());

        CV cv = CV.builder()
                .name("sample.pdf")
                .type("application/pdf")
                .data("%PDF-1.4\n%Mock PDF content\n".getBytes())
                .size((long) "%PDF-1.4\n%Mock PDF content\n".getBytes().length)
                .lastModified("2024-10-01T12:00:00Z")
                .lastModifiedDate(java.time.Instant.now())
                .build();

        when(etudiantService.getCvByEmail("email@email.email")).thenReturn(
                Optional.of(new EtudiantCvDTO() {{
                    setName(cv.getName());
                    setType(cv.getType());
                    setSize(cv.getSize());
                    setData(Base64.getEncoder().encodeToString(cv.getData()));
                    setLastModified(cv.getLastModified());
                    setLastModifiedDate(cv.getLastModifiedDate());
                }})
        );

        mockMvc.perform(get("/etudiant/telecharger-cv/email@email.email")
                        .with(csrf()))
                .andExpect(status().isOk());
    }

}
