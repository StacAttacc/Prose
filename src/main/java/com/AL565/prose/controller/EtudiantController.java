package com.AL565.prose.controller;

import com.AL565.prose.model.CV;
import com.AL565.prose.service.EtudiantInscriptionService;
import com.AL565.prose.service.dto.EtudiantDto;
import com.AL565.prose.service.exception.EmailAlreadyExistsException;
import com.AL565.prose.service.ProseCvService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/etudiant")
public class EtudiantController {

    private final EtudiantInscriptionService etudiantInscriptionService;

    private final ProseCvService cvService;

    public EtudiantController(EtudiantInscriptionService etudiantInscriptionService, ProseCvService cvService) {
        this.etudiantInscriptionService = etudiantInscriptionService;
        this.cvService = cvService;
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



    @PostMapping("/televerser-cv")
    public ResponseEntity<Void> televerser(@RequestParam("cv") MultipartFile cv,
                                           @RequestParam("studentId") Long idEtudiant,
                                           @RequestParam(value = "lastModified", required = false) String lastModified) {
        cvService.saveCv(cv, idEtudiant, lastModified);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/telecharger-cv/{etudiantId}")
    public ResponseEntity<byte[]> telecharger(@PathVariable Long etudiantId) {
        CV cv = cvService.getCvOrThrow(etudiantId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(cv.getType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + cv.getName() + "\"")
                .body(cv.getData());
    }

}