package com.AL565.prose.controller;

import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.CvDecisionDTO;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gestionnaire")
@RequiredArgsConstructor
public class GestionnaireController {

    private final GestionnaireService gestionnaireService;

    @GetMapping("/cv/pending")
    public ResponseEntity<List<GestionnaireCvDTO>> getPendingCvs() throws Exception {
        List<GestionnaireCvDTO> cvs = gestionnaireService.getPendingCvs();
        return ResponseEntity.ok(cvs);
    }

    @PostMapping("/cv/change-status")
    public ResponseEntity<Void> changeCvStatus(@RequestBody CvDecisionDTO cvDecision) throws Exception {
        gestionnaireService.changeCvStatus(cvDecision.id, cvDecision.status, cvDecision.comment);
        return ResponseEntity.ok().build();
    }
}
