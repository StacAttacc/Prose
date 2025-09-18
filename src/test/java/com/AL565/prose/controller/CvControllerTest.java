package com.AL565.prose.controller;

import com.AL565.prose.model.CV;
import com.AL565.prose.repository.ProseCvRepository;
import com.AL565.prose.service.EtudiantInscriptionService;
import com.AL565.prose.service.ProseCvService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("dev")
@WebMvcTest(controllers = EtudiantController.class)
class CvControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProseCvRepository cvRepository;

    @MockitoBean
    private ProseCvService cvService;

    @MockitoBean
    private EtudiantInscriptionService etudiantInscriptionService;

    @Test
    @WithMockUser(username = "testuser", roles = {"ETUDIANT"})
    void televerserCv_shouldReturnCreatedForAuthenticatedUser() throws Exception {
        mockMvc.perform(multipart("/etudiant/televerser-cv")
                        .file("cv", "PDF content".getBytes())
                        .param("studentId", "1")
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
                        .param("studentId", "1")
                        .param("lastModified", "2024-10-01T12:00:00Z")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .with(csrf()))
                .andExpect(status().isCreated());

        CV cv = CV.builder()
                .name("sample.pdf")
                .type("application/pdf")
                .data("%PDF-1.4\n%Mock PDF content\n".getBytes())
                .build();
        when(cvService.getCvOrThrow(1L)).thenReturn(cv);

        mockMvc.perform(get("/etudiant/telecharger-cv/1")
                        .with(csrf()))
                .andExpect(status().isOk());
    }

}
