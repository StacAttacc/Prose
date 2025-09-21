package com.AL565.prose.controller;

import com.AL565.prose.service.EtudiantInscriptionService;
import com.AL565.prose.service.dto.EtudiantDto;
import com.AL565.prose.service.exception.EmailAlreadyExistsException;
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
    public ResponseEntity<String> inscrireEtudiant(@RequestBody EtudiantDto dto) {
        try {
            etudiantInscriptionService.inscrireEtudiant(dto);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'inscription");
        }
    }




}