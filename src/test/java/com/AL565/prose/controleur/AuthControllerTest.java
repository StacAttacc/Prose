package com.AL565.prose.controleur;

import com.AL565.prose.controller.AuthController;
import com.AL565.prose.model.auth.Role;
import com.AL565.prose.security.exceptions.AuthenticationException;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.AuthService;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.LoginRequestDTO;
import com.AL565.prose.service.dto.ProseUserDTO;
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
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private EmployeurService employeurService;

    @Test
    void login_success() throws Exception {
        LoginRequestDTO request = createTestLoginRequest();
        ProseUserDTO expectedResponse = createTestProseUserDTO();

        when(authService.login(any(LoginRequestDTO.class))).thenReturn(expectedResponse);

        String content = new ObjectMapper().writeValueAsString(request);
        MvcResult result = mockMvc.perform(post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(200);
        Assertions.assertThat(result.getResponse().getContentType()).contains("application/json");
    }

    @Test
    void login_badCredentials() throws Exception {
        LoginRequestDTO request = createTestLoginRequest();

        
        doThrow(new AuthenticationException(HttpStatus.UNAUTHORIZED, "Invalid credentials"))
                .when(authService).login(any(LoginRequestDTO.class));

        String content = new ObjectMapper().writeValueAsString(request);
        MvcResult result = mockMvc.perform(post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(401);
    }

    @Test
    void login_userNotFound() throws Exception {
        LoginRequestDTO request = createTestLoginRequest();
        
        doThrow(new UserNotFoundException())
                .when(authService).login(any(LoginRequestDTO.class));

        String content = new ObjectMapper().writeValueAsString(request);
        MvcResult result = mockMvc.perform(post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andReturn();

        Assertions.assertThat(result.getResponse().getStatus()).isEqualTo(401);
        Assertions.assertThat(result.getResponse().getContentAsString()).contains("User not found");
    }

    private LoginRequestDTO createTestLoginRequest() {
        LoginRequestDTO request = new LoginRequestDTO();
        request.setEmail("alice@example.com");
        request.setPassword("secret");
        return request;
    }

    private ProseUserDTO createTestProseUserDTO() {
        EtudiantPasswordDTO dto = new EtudiantPasswordDTO();
        dto.setId(1L);
        dto.setEmail("alice@example.com");
        dto.setFirstName("Alice");
        dto.setLastName("Liddell");
        dto.setRole(Role.ETUDIANT);
        dto.setToken("jwt-123");
        return dto;
    }
}