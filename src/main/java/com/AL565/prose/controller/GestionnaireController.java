package com.AL565.prose.controller;

import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.CvDecisionDTO;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
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

    @PostMapping("/cv/change-status")
    public ResponseEntity<Void> changeCvStatus(@RequestBody CvDecisionDTO cvDecision) throws Exception {
        gestionnaireService.changeCvStatus(cvDecision.id, cvDecision.status, cvDecision.comment);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/cv/all")
    public ResponseEntity<List<GestionnaireCvDTO>> getAllCvs() throws Exception {
        List<GestionnaireCvDTO> cvs = gestionnaireService.getAllCvs();
        return ResponseEntity.ok(cvs);
    }

    @GetMapping("/stages")
    public List<StageDTO> getAllStages() {
        return gestionnaireService.getAllStages();
    }
}
