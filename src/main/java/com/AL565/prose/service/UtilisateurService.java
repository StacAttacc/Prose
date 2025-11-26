package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.dto.*;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UtilisateurService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final ProseUserRepository userRepository;

    public ProseUserDTO login(LoginRequestDTO request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtTokenProvider.generateToken(authentication);

        ProseUser user = userRepository.findByCredentials_Username(request.getEmail())
                .orElseThrow(UserNotFoundException::new);

        return switch (user.getRole()) {
            case EMPLOYEUR -> EmployeurDTO.toDTO((Employeur) user, token);
            case ETUDIANT -> EtudiantDTO.toDTO((Etudiant) user, token);
            case GESTIONNAIRE -> GestionnaireDTO.toDTO((Gestionnaire) user, token);
            case PROFESSEUR -> ProfesseurDTO.toDTO((Professeur) user, token);
        };
    }
}
