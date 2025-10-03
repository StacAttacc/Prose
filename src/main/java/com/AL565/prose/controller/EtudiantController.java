package com.AL565.prose.controller;

import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.dto.EtudiantCvDTO;
import com.AL565.prose.security.exceptions.CvExceptions;
import com.AL565.prose.service.dto.EtudiantDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequestMapping("/etudiant")
public class EtudiantController {

    private final EtudiantService etudiantService;

    public EtudiantController(EtudiantService etudiantService) {
        this.etudiantService = etudiantService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> inscrireEtudiant(@RequestBody EtudiantDTO dto) {
        try {
            etudiantService.inscrireEtudiant(dto);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'inscription");
        }
    }



    @PostMapping("/televerser-cv")
    public ResponseEntity<String> televerser(@RequestParam("cv") MultipartFile cv,
                                             @RequestParam("email") String email,
                                             @RequestParam(value = "lastModified", required = false) String lastModified)
            throws Exception {
        etudiantService.saveCv(cv, email, lastModified);
        return ResponseEntity.status(HttpStatus.CREATED).body("CV téléversé avec succès");
    }

    @GetMapping("/telecharger-cv/{email}")
    public ResponseEntity<EtudiantCvDTO> telecharger(@PathVariable String email)
            throws CvExceptions.StudentNotFoundException{
        Optional<EtudiantCvDTO> cv = etudiantService.getByEmail(email);
        return ResponseEntity.ok(Optional.of(cv).get().orElse(null));
    }
}
