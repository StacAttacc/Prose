// src/main/java/com/AL565/prose/controller/OfferController.java
package com.AL565.prose.controller;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.service.StageService;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.dto.StageEnregistrerDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final StageService offerService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEUR')")
    public ResponseEntity<StageDTO> createOffer(
            @AuthenticationPrincipal Employeur employeur,
            @Valid @RequestBody StageEnregistrerDTO request
    ) {
        if (employeur == null) {
            throw new AccessDeniedException("Non autorisé");
        }

        StageDTO response = offerService.createStage(employeur, request);
        URI location = URI.create("/api/offers/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }
}
