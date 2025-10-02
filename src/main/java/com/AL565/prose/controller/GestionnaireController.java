package com.AL565.prose.controller;

import com.AL565.prose.service.CvService;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gestionnaire")
@RequiredArgsConstructor
public class GestionnaireController {

    private final CvService cvService;

    @GetMapping("/cv/pending")
    public ResponseEntity<List<GestionnaireCvDTO>> getPendingCvs() throws Exception {
        List<GestionnaireCvDTO> cvs = cvService.getPendingCvs();
        return ResponseEntity.ok(cvs);
    }

    @PostMapping("/cv/{cvId}/approve")
    public ResponseEntity<Void> approveCv(@PathVariable Long cvId) throws Exception {
        cvService.approveCv(cvId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cv/{cvId}/reject")
    public ResponseEntity<Void> rejectCv(@PathVariable Long cvId) throws Exception {
        cvService.rejectCv(cvId);
        return ResponseEntity.ok().build();
    }
}
