package com.AL565.prose.controleur;

import com.AL565.prose.controller.EmployeurController;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import com.AL565.prose.model.notifications.PostulationNotification;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.dto.EmployeurPasswordDTO;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.dto.notifications.NotificationGroupDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
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
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

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

    @MockitoBean
    private NotificationRepository notificationRepository;

    @MockitoBean
    private PostulationNotificationRepository postulationNotificationRepository;

    @MockitoBean
    private EtudiantCvNotificationRepository etudiantCvNotificationRepository;

    @MockitoBean
    private GestionnaireCvNotificationRepository gestionnaireCvNotificationRepository;

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
                1L, stage.getId(), com.AL565.prose.model.CandidatureStatus.SOUMISE, null, null, null, null, 0L, new EtudiantDTO()
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
                        new TypeReference<>() {
                        }
                );

        assertThat(candidatures.getData().size()).isEqualTo(1);
    }

    @Test
    void markNotificationAsRead_success_returnsOk() throws Exception {
        mockMvc.perform(put("/employeur/notifications/read/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void markNotificationAsRead_whenServiceThrows_returns500WithMessage() throws Exception {
        doThrow(new Exception("boom")).when(employeurService).markNotificationAsRead(anyLong());

        mockMvc.perform(put("/employeur/notifications/read/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Erreur lors du marquage de la notification comme lue")))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void getPostulationNotifications_success_returnsDTO() throws Exception {
        String email = "employer@company.com";

        PostulationNotification pn = new PostulationNotification();
        pn.setId(1L);
        pn.setCreatedAt(LocalDateTime.now());

        NotificationGroupDTO group = NotificationGroupDTO.toDTO("postulation", List.of(pn));
        NotificationsResponseDTO notifications = NotificationsResponseDTO.toDTO(List.of(group));

        when(employeurService.getPostulationNotifications(email)).thenReturn(notifications);

        MvcResult result = mockMvc.perform(get("/employeur/notifications/postulations/" + email)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        TypeReference<com.AL565.prose.service.dto.ReturnEntityDTO<NotificationsResponseDTO>> tr =
                new TypeReference<>() { };

        com.AL565.prose.service.dto.ReturnEntityDTO<NotificationsResponseDTO> response =
                objectMapper.readValue(result.getResponse().getContentAsString(), tr);

        assertThat(response.getMessage()).isEqualTo("Notifications: ");
        assertThat(response.getData()).isNotNull();
        assertThat(response.getData().getTotalCount()).isEqualTo(1);
        assertThat(response.getData().getGroups()).hasSize(1);
        assertThat(response.getData().getGroups().getFirst().getItems()).hasSize(1);

        verify(employeurService, times(1)).getPostulationNotifications(email);
    }

    @Test
    void getPostulationNotifications_whenServiceThrows_returns500WithMessage() throws Exception {
        doThrow(new Exception("boom")).when(employeurService).getPostulationNotifications(anyString());

        mockMvc.perform(get("/employeur/notifications/postulations/employer@company.com")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
        verify(employeurService, times(1)).getPostulationNotifications(anyString());
    }

    @Test
    void convoquerEntrevue_success() throws Exception {
        Long candidatureId = 1L;
        InterviewDTO interviewDTO = new InterviewDTO();
        interviewDTO.setDateTime("2025-11-15T10:30:00");
        
        String requestBody = objectMapper.writeValueAsString(interviewDTO);
        mockMvc.perform(put("/employeur/candidatures/" + candidatureId + "/convoquer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Convocation réussie")));

        verify(employeurService, times(1)).convoquerEntrevue(eq(candidatureId), any(InterviewDTO.class));
    }

    @Test
    void convoquerEntrevue_whenServiceThrows_returns500() throws Exception {
        Long candidatureId = 1L;
        InterviewDTO interviewDTO = new InterviewDTO();
        interviewDTO.setDateTime("2025-11-15T10:30:00");
        
        String requestBody = objectMapper.writeValueAsString(interviewDTO);

        doThrow(new RuntimeException("boom")).when(employeurService).convoquerEntrevue(anyLong(), any(InterviewDTO.class));

        mockMvc.perform(put("/employeur/candidatures/" + candidatureId + "/convoquer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message", is("Erreur lors de la convocation de l'entrevue")));

        verify(employeurService, times(1)).convoquerEntrevue(anyLong(), any(InterviewDTO.class));
    }
}