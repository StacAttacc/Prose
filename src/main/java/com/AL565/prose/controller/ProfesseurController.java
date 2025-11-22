package com.AL565.prose.controller;

import com.AL565.prose.service.ProfesseurService;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.MillieuEvaluationDTO;
import com.AL565.prose.service.dto.ReturnEntityDTO;
import lombok.AllArgsConstructor;
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
            professeurService.evaluateWorkplace(evaluation);
            return ResponseEntity.ok("Workplace evaluated");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur interne du serveur");
        }

    }

    @GetMapping("/{professeurId}/millieus-awaiting-evaluation")
    public ResponseEntity<ReturnEntityDTO<List<CandidatureDTO>>> getStagesAwaitingEvaluation(@RequestParam String year, @PathVariable String professeurId) {
        try {
            List<CandidatureDTO> candidatures = professeurService.getAllStagesAwaitingEvaluation(year, professeurId);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Candidatures trouvés", candidatures));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ReturnEntityDTO<>("Erreur interne du serveur", null));
        }
    }
}
