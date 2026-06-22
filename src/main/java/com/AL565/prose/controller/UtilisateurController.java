package com.AL565.prose.controller;

import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.UtilisateurService;
import com.AL565.prose.service.dto.ReturnEntityDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@AllArgsConstructor
public class UtilisateurController {
    private final UtilisateurService utilisateurService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/{ententeId}/pdf")
    public ResponseEntity<ReturnEntityDTO<String>> getPDFEntente(@PathVariable String ententeId,
                                                                 @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String callerEmail = jwtTokenProvider.getEmailFromJWT(token);
            String pdf = utilisateurService.getPDFEntente(ententeId, callerEmail);
            return ResponseEntity.ok(new ReturnEntityDTO<>("PDF genere", pdf));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ReturnEntityDTO<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ReturnEntityDTO<>("Erreur interne du serveur", null));
        }
    }
}
