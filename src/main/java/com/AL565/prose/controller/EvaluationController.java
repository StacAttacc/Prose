package com.AL565.prose.controller;

import com.AL565.prose.service.EvaluationService;
import com.AL565.prose.service.dto.EntenteDTO;
import com.AL565.prose.service.dto.EvaluationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employeur/{employeurId}/evaluations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<EvaluationDTO> createEvaluation(
            @PathVariable Long employeurId,
            @RequestBody EvaluationDTO evaluationDTO) {
        try {
            EvaluationDTO createdEvaluation = evaluationService.createEvaluation(employeurId, evaluationDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvaluation);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/entente/{ententeId}")
    public ResponseEntity<EvaluationDTO> getEvaluationByEntente(
            @PathVariable Long employeurId,
            @PathVariable Long ententeId) {
        try {
            EvaluationDTO evaluation = evaluationService.getEvaluationByEntente(employeurId, ententeId);
            return ResponseEntity.ok(evaluation);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/ententes")
    public ResponseEntity<List<EntenteDTO>> getEntentesForEvaluation(
            @PathVariable Long employeurId,
            @RequestParam(required = false) String year) {
        try {
            List<EntenteDTO> ententes = evaluationService.getEntentesForEvaluation(employeurId, year);
            return ResponseEntity.ok(ententes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}