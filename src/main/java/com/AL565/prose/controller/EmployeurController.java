package com.AL565.prose.controller;


import com.AL565.prose.model.Employeur;
import com.AL565.prose.service.dto.EmployeurEnregistrerDTO;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/employeur")
public class EmployeurController {

    private EmployeurService employeurService;

    @PostMapping("/register")
    public ResponseEntity<String> enregistrer(@RequestBody EmployeurEnregistrerDTO employeurEnregistrerDTO) {
        try {
            employeurService.enregistrer(employeurEnregistrerDTO);
            return new ResponseEntity<>("Created", HttpStatus.CREATED);
        } catch (EmailAlreadyExistsException e) {
            return new ResponseEntity<>("Le email est déja en cours d'utilisation.", HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/createStage")
    @PreAuthorize("hasRole('EMPLOYEUR')")
    public ResponseEntity<String> createOffer(
            @AuthenticationPrincipal Employeur employeur,
            @Valid @RequestBody StageDTO request
    ) {
        if (employeur == null) {
            return new ResponseEntity<>("Non autorisé", HttpStatus.UNAUTHORIZED);
        }

        try {
            employeurService.createStage(employeur, request);
            return new ResponseEntity<>("Stage créé avec succès", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Erreur lors de la création du stage", HttpStatus.BAD_REQUEST);
        }
    }



    @GetMapping("/stages")
    @PreAuthorize("hasRole('EMPLOYEUR')")
    public ResponseEntity<List<StageDTO>> listMyStages(@AuthenticationPrincipal Employeur employeur) {
        if (employeur == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(employeurService.listStagesFor(employeur));
    }


    @GetMapping("/{employeurId}/stages/published")
    public ResponseEntity<List<StageDTO>> listPublishedByEmployer(@PathVariable Long employeurId) {
        return ResponseEntity.ok(employeurService.listPublishedByEmployerId(employeurId));
    }


}

