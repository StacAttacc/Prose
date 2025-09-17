package com.AL565.prose.controller;

import com.AL565.prose.model.Discipline;
import com.AL565.prose.service.EtudiantInscriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/etudiant")
public class EtudiantController {

    private final EtudiantInscriptionService etudiantInscriptionService;

    public EtudiantController(EtudiantInscriptionService etudiantInscriptionService) {
        this.etudiantInscriptionService = etudiantInscriptionService;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> inscrireEtudiant(
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam Discipline discipline) {
        etudiantInscriptionService.inscrireEtudiant(firstName, lastName, email, password, discipline);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }


}