package com.AL565.prose.service;

import com.AL565.prose.service.dto.LoginRequestDTO;
import com.AL565.prose.service.dto.ProseUserDTO;

import lombok.RequiredArgsConstructor;

import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.model.ProseUser;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

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

        return ProseUserDTO.toDtoWithToken(user, token);

    }
}
