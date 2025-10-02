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

    @PostMapping("/cv/approve")
    public ResponseEntity<Void> approveCv(@RequestBody CvDecisionDTO decisionDTO) throws Exception {
        gestionnaireService.approveCv(decisionDTO.id, decisionDTO.comment);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cv/reject")
    public ResponseEntity<Void> rejectCv(@RequestBody CvDecisionDTO decisionDTO) throws Exception {
        gestionnaireService.rejectCv(decisionDTO.id, decisionDTO.comment);
        return ResponseEntity.ok().build();
    }
}
