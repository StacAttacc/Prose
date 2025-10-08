package com.AL565.prose.service;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.ProseUser;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.dto.LoginRequestDTO;
import com.AL565.prose.service.dto.ProseUserDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private ProseUserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_success() {
        // Arrange
        LoginRequestDTO request = createTestLoginRequest();
        ProseUser user = createTestProseUser();
        Authentication authentication = mock(Authentication.class);
        String expectedToken = "jwt-token-123";

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtTokenProvider.generateToken(authentication))
                .thenReturn(expectedToken);
        when(userRepository.findByCredentials_Username(request.getEmail()))
                .thenReturn(Optional.of(user));

        // Act
        ProseUserDTO result = authService.login(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo(request.getEmail());
        assertThat(result.getFirstName()).isEqualTo("Alice");
        assertThat(result.getLastName()).isEqualTo("Liddell");
        assertThat(result.getRole()).isEqualTo(Role.ETUDIANT);
        assertThat(result.getToken()).isEqualTo(expectedToken);

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider, times(1)).generateToken(authentication);
        verify(userRepository, times(1)).findByCredentials_Username(request.getEmail());
    }

    @Test
    void login_badCredentials() {
        // Arrange
        LoginRequestDTO request = createTestLoginRequest();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid credentials");

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider, never()).generateToken(any());
        verify(userRepository, never()).findByCredentials_Username(any());
    }

    @Test
    void login_userNotFound() {
        // Arrange
        LoginRequestDTO request = createTestLoginRequest();
        Authentication authentication = mock(Authentication.class);
        String expectedToken = "jwt-token-123";

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtTokenProvider.generateToken(authentication))
                .thenReturn(expectedToken);
        when(userRepository.findByCredentials_Username(request.getEmail()))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("userNotFound");

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider, times(1)).generateToken(authentication);
        verify(userRepository, times(1)).findByCredentials_Username(request.getEmail());
    }

    private LoginRequestDTO createTestLoginRequest() {
        LoginRequestDTO request = new LoginRequestDTO();
        request.setEmail("alice@example.com");
        request.setPassword("secret");
        return request;
    }

    private ProseUser createTestProseUser() {
        Credentials credentials = Credentials.builder()
                .username("alice@example.com")
                .password("encodedPassword")
                .role(Role.ETUDIANT)
                .build();
        
        ProseUser user = new Etudiant("Alice", "Liddell", credentials, Discipline.INFIRMIER) {
        };
        
        user.setId(1L);
        
        return user;
    }
}
