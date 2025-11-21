package com.AL565.prose.controller;

import com.AL565.prose.service.ProfesseurService;
import com.AL565.prose.service.dto.MillieuEvaluationDTO;
import com.AL565.prose.service.dto.ReturnEntityDTO;
import com.AL565.prose.service.dto.StageSimpleDTO;
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

    @GetMapping("/stages-awaiting-evaluation")
    public ResponseEntity<ReturnEntityDTO<List<StageSimpleDTO>>> getStagesAwaitingEvaluation(@RequestParam String year) {
        try {
            List<StageSimpleDTO> stages = professeurService.getAllStagesAwaitingEvaluation(year);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Stages trouvés", stages));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ReturnEntityDTO<>("Erreur interne du serveur", null));
        }
    }
}
