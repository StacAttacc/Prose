package com.AL565.prose.controller;

import com.AL565.prose.service.ProfesseurService;
import com.AL565.prose.service.dto.*;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/professeur")
@AllArgsConstructor
public class ProfesseurController {
    private ProfesseurService professeurService;

    @PostMapping("/evaluate")
    public ResponseEntity<String> evaluteWorkplace(@RequestBody MillieuEvaluationDTO evaluation) {
        try {
            professeurService.evaluateWorkplace(evaluation, evaluation.getCandidatureId());
            return ResponseEntity.ok("Workplace evaluated");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur interne du serveur");
        }

    }

    @GetMapping("/{professeurId}/mes-etudiants-candidatures")
    public ResponseEntity<ReturnEntityDTO<List<CandidatureEvaluationDTO>>> getCandidaturesAwaitingEvaluation(@RequestParam String year, @PathVariable String professeurId) {
        try {
            List<CandidatureEvaluationDTO> candidatures = professeurService.getAllCandidaturesProfesseurRelated(year, professeurId);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Candidatures trouvés", candidatures));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ReturnEntityDTO<>("Erreur interne du serveur", null));
        }
    }

    @GetMapping("/{professeurId}/getCandidatures")
    public ResponseEntity<ReturnEntityDTO<List<EtudiantCandidaturesDTO>>> getAllEtudiantsCandidatures(@RequestParam(required = false) String year, @PathVariable String professeurId) {
        try {
            List<EtudiantCandidaturesDTO> etudiants = professeurService.getAllEtudiantsCandidatures(year, professeurId);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Trouvés", etudiants));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ReturnEntityDTO<>("Erreur interne du serveur", null));
        }
    }
}
