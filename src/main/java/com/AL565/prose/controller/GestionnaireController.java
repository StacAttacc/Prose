package com.AL565.prose.controller;

import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.ReturnEntityDTO;
import com.AL565.prose.service.dto.RejectionRequestDTO;
import com.AL565.prose.service.dto.StageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gestionnaire")
@RequiredArgsConstructor
public class GestionnaireController {

    private final GestionnaireService gestionnaireService;

    @GetMapping("/stages/status/{status}")
    public ResponseEntity<ReturnEntityDTO<List<StageDTO>>> getStagesByStatus(@PathVariable String status) {
        System.out.println("status: " + status);
        List<StageDTO> stages = gestionnaireService.getStagesByStatus(status);
        return ResponseEntity.ok(new ReturnEntityDTO<>("Liste des stages " + status, stages));
    }

    @PutMapping("/stages/{id}/approuver")
    public ResponseEntity<ReturnEntityDTO<StageDTO>> approuverStage(@PathVariable Long id) {
        StageDTO stage = gestionnaireService.approuverStage(id);
        return ResponseEntity.ok(new ReturnEntityDTO<>("Stage approuvé avec succès", stage));
    }

    @PutMapping("/stages/{id}/rejeter")
    public ResponseEntity<ReturnEntityDTO<StageDTO>> rejeterStage(
            @PathVariable Long id,
            @RequestBody RejectionRequestDTO rejectionRequest) {
        StageDTO stage = gestionnaireService.rejeterStage(id, rejectionRequest.getReason());
        return ResponseEntity.ok(new ReturnEntityDTO<>("Stage rejeté avec succès", stage));
    }
}