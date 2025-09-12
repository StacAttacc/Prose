package com.AL565.prose.controller;

import com.AL565.prose.service.dto.EtudiantInscriptionDto;
import com.AL565.prose.service.EtudiantInscriptionService;
import jakarta.validation.Valid;
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
    public ResponseEntity<EtudiantInscriptionDto> inscrireEtudiant(@Valid @RequestBody EtudiantInscriptionDto dto) {
        EtudiantInscriptionDto responseDto = etudiantInscriptionService.inscrireEtudiant(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }
}