package com.AL565.prose.controller;

import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.security.exceptions.AuthenticationException;
import com.AL565.prose.service.UtilisateurService;
import com.AL565.prose.service.dto.LoginRequestDTO;
import com.AL565.prose.service.dto.ProseUserDTO;
import com.AL565.prose.service.dto.ReturnEntityDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurService utilisateurService;

    @PostMapping("/login")
    public ResponseEntity<ReturnEntityDTO<ProseUserDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            ProseUserDTO user = utilisateurService.login(request);
            return ResponseEntity.status(200).body(new ReturnEntityDTO<>("Login successful", user));
        } catch (UserNotFoundException | AuthenticationException e){
            return ResponseEntity.status(401).body(new ReturnEntityDTO<>("Informations invalide, veuillez réessayer.", null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ReturnEntityDTO<>("Service indisponible. Veuillez réessayer plus tard.", null));
        }
    }

}
