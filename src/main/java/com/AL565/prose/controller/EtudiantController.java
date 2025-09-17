package com.AL565.prose.controller;

import com.AL565.prose.service.EtudiantInscriptionService;
import com.AL565.prose.service.dto.EtudiantDto;
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
    public ResponseEntity<Void> inscrireEtudiant(@RequestBody EtudiantDto dto) {
        etudiantInscriptionService.inscrireEtudiant(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }



}