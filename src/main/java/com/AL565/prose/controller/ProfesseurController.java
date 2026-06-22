package com.AL565.prose.controller;

import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.ProfesseurService;
import com.AL565.prose.service.dto.*;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/professeur")
@AllArgsConstructor
public class ProfesseurController {
    private final ProfesseurService professeurService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/evaluate")
    public ResponseEntity<String> evaluteWorkplace(@RequestBody MillieuEvaluationDTO evaluation,
                                                   @RequestHeader("Authorization") String authHeader) {
        try {
            String callerEmail = jwtTokenProvider.getEmailFromJWT(authHeader.replace("Bearer ", ""));
            professeurService.evaluateWorkplace(evaluation, evaluation.getCandidatureId(), callerEmail);
            return ResponseEntity.ok("Workplace evaluated");
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur interne du serveur");
        }

    }

    @GetMapping("/{professeurId}/mes-etudiants-candidatures")
    public ResponseEntity<ReturnEntityDTO<List<CandidatureEvaluationDTO>>> getCandidaturesAwaitingEvaluation(
            @RequestParam String year,
            @PathVariable String professeurId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String callerEmail = jwtTokenProvider.getEmailFromJWT(authHeader.replace("Bearer ", ""));
            List<CandidatureEvaluationDTO> candidatures = professeurService.getAllCandidaturesProfesseurRelated(year, professeurId, callerEmail);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Candidatures trouvés", candidatures));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ReturnEntityDTO<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ReturnEntityDTO<>("Erreur interne du serveur", null));
        }
    }

    @GetMapping("/{professeurId}/getCandidatures")
    public ResponseEntity<ReturnEntityDTO<List<EtudiantCandidaturesDTO>>> getAllEtudiantsCandidatures(
            @RequestParam(required = false) String year,
            @PathVariable String professeurId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String callerEmail = jwtTokenProvider.getEmailFromJWT(authHeader.replace("Bearer ", ""));
            List<EtudiantCandidaturesDTO> etudiants = professeurService.getAllEtudiantsCandidatures(year, professeurId, callerEmail);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Trouvés", etudiants));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ReturnEntityDTO<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ReturnEntityDTO<>("Erreur interne du serveur", null));
        }
    }
}
