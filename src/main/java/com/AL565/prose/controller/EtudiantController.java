package com.AL565.prose.controller;

import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.EtudiantService;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.EtudiantCvDTO;
import com.AL565.prose.security.exceptions.CvExceptions;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.ReturnEntityDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.dto.EtudiantCandidatureDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequestMapping("/etudiant")
public class EtudiantController {

    private final EtudiantService etudiantService;
    private final JwtTokenProvider jwtTokenProvider;

    public EtudiantController(EtudiantService etudiantService, JwtTokenProvider jwtTokenProvider) {
        this.etudiantService = etudiantService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<String> inscrireEtudiant(@RequestBody EtudiantPasswordDTO dto) {
        try {
            etudiantService.inscrireEtudiant(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body("Inscription réussie");
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
    public ResponseEntity<EtudiantCvDTO> telecharger(@PathVariable String email) {
        Optional<EtudiantCvDTO> cv = etudiantService.getByEmail(email);
        return ResponseEntity.ok(Optional.of(cv).get().orElse(null));
    }

    @GetMapping("/stages/approuves")
    public ResponseEntity<ReturnEntityDTO<List<StageDTO>>> getEtudiantStages(@RequestHeader("Authorization") String token) {
        try {
            List<StageDTO> stages = etudiantService.getEtudiantStages(token);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Stages approuvés", stages));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ReturnEntityDTO<>("Erreur lors de la récupération des stages approuvés",null));
        }
    }

    @PostMapping("/candidature")
    public ResponseEntity<String> soumettreCandidat(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("stageId") Long stageId,
            @RequestParam(value = "motivationLetter", required = false) MultipartFile motivationLetter) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtTokenProvider.getEmailFromJWT(token);

            // Construire le DTO avec ou sans lettre de motivation
            CandidatureDTO.CandidatureDTOBuilder builder = CandidatureDTO.builder()
                    .stageId(stageId)
                    .etudiantEmail(email);

            // Ajouter la lettre de motivation si elle est fournie
            if (motivationLetter != null && !motivationLetter.isEmpty()) {
                builder.motivationLetterData(motivationLetter.getBytes())
                       .motivationLetterFileName(motivationLetter.getOriginalFilename())
                       .motivationLetterContentType(motivationLetter.getContentType())
                       .motivationLetterSize(motivationLetter.getSize());
            }

            CandidatureDTO candidatureDTO = builder.build();

            etudiantService.createCandidature(candidatureDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body("Candidature soumise avec succès");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur lors de la soumission de la candidature: " + e.getMessage());
        }
    }

    @GetMapping("/candidature/check/{stageId}")
    public ResponseEntity<Map<String, Boolean>> checkIfAlreadyApplied(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long stageId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtTokenProvider.getEmailFromJWT(token);

            boolean hasApplied = etudiantService.hasAlreadyApplied(email, stageId);

            Map<String, Boolean> response = new HashMap<>();
            response.put("hasApplied", hasApplied);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Boolean> response = new HashMap<>();
            response.put("hasApplied", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/cv/status")
    public ResponseEntity<Map<String, Boolean>> checkCvStatus(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtTokenProvider.getEmailFromJWT(token);
            boolean hasApprovedCv = etudiantService.hasApprovedCv(email);

            Map<String, Boolean> response = new HashMap<>();
            response.put("available", hasApprovedCv);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Boolean> response = new HashMap<>();
            response.put("available", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/cv/info")
    public ResponseEntity<EtudiantCvDTO> getCvInfo(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtTokenProvider.getEmailFromJWT(token);

            Optional<EtudiantCvDTO> cvInfo = etudiantService.getByEmail(email);

            if (cvInfo.isPresent()) {
                return ResponseEntity.ok(cvInfo.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/candidatures")
    public ResponseEntity<ReturnEntityDTO<List<EtudiantCandidatureDTO>>> getMesCandidatures(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtTokenProvider.getEmailFromJWT(token);

            List<EtudiantCandidatureDTO> candidatures = etudiantService.getMesCandidatures(email);

            return ResponseEntity.ok(new ReturnEntityDTO<>("Candidatures récupérées avec succès", candidatures));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la récupération des candidatures", null));
        }
    }

}
