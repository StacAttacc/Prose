package com.AL565.prose.controller;

import com.AL565.prose.service.EntenteService;
import com.AL565.prose.service.UtilisateurService;
import com.AL565.prose.service.dto.ReturnEntityDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@AllArgsConstructor
public class UtilisateurController {
    private UtilisateurService utilisateurService;

    @GetMapping("/{ententeId}/pdf")
    public ResponseEntity<ReturnEntityDTO<String>> getPDFEntente(@PathVariable String ententeId) {
        try {
            String pdf = utilisateurService.getPDFEntente(ententeId);
            return ResponseEntity.ok(new ReturnEntityDTO<>("PDF genere", pdf));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ReturnEntityDTO<>("Erreur interne du serveur", null));
        }
    }
}
