package com.AL565.prose.service;

import com.AL565.prose.service.dto.LoginRequestDTO;
import com.AL565.prose.service.dto.ProseUserDTO;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.model.ProseUser;
import com.AL565.prose.repository.ProseUserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final ProseUserRepository userRepository;

    public AuthService(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider, ProseUserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    public ProseUserDTO login(LoginRequestDTO request) {
        // Authentifie l'utilisateur
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(), 
                request.getPassword()
            )
        );

        // Génére le token JWT
        String token = jwtTokenProvider.generateToken(authentication);
        
        // Récupére l'utilisateur complet
        ProseUser user = userRepository.findByCredentials_Username(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        return ProseUserDTO.toDtoWithToken(user, token);

    }
}
