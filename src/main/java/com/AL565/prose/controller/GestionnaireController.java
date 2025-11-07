package com.AL565.prose.controller;

import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gestionnaire")
@RequiredArgsConstructor
public class GestionnaireController {

    private final GestionnaireService gestionnaireService;

    @GetMapping("/stages")
    public ResponseEntity<ReturnEntityDTO<List<StageDTO>>> getAllStagesOfSession(@RequestParam(required = false) String year) {
        try {
            List<StageDTO> stages = gestionnaireService.getAllStages(year);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Liste des stages", stages));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ReturnEntityDTO<>("Erreur lors de la récupération des stages", null));
        }
    }

    @GetMapping("/stages/status/{status}")
    public ResponseEntity<ReturnEntityDTO<List<StageDTO>>> getStagesByStatus(@PathVariable String status, @RequestParam(required = false) String year) {
        try {
            List<StageDTO> stages = gestionnaireService.getStagesByStatus(status, year);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Liste des stages " + status, stages));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ReturnEntityDTO<>("Erreur lors de la récupération des stages", null));
        }
    }

    @PutMapping("/stages/{id}/approuver")
    public ResponseEntity<ReturnEntityDTO<StageDTO>> approuverStage(@PathVariable Long id) {
        try {
            StageDTO stage = gestionnaireService.approuverStage(id);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Stage approuvé avec succès", stage));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ReturnEntityDTO<>("Erreur lors de l'approuver du stage", null));
        }
    }

    @PutMapping("/stages/{id}/rejeter")
    public ResponseEntity<ReturnEntityDTO<StageDTO>> rejeterStage(
            @PathVariable Long id,
            @RequestBody RejectionRequestDTO rejectionRequest) {
        try {
            StageDTO stage = gestionnaireService.rejeterStage(id, rejectionRequest.getReason());
            return ResponseEntity.ok(new ReturnEntityDTO<>("Stage rejeté avec succès", stage));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ReturnEntityDTO<>("Erreur lors du rejet du stage", null));
        }
    }

    @PostMapping("/cv/change-status")
    public ResponseEntity<ReturnEntityDTO<Void>> changeCvStatus(@RequestBody CvDecisionDTO cvDecision) {
        try {
            gestionnaireService.changeCvStatus(cvDecision.id, cvDecision.status, cvDecision.comment);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la modification du statut du CV", null));
        }
    }

    @GetMapping("/cv/all")
    public ResponseEntity<List<GestionnaireCvDTO>> getAllCvs() throws Exception {
        List<GestionnaireCvDTO> cvs = gestionnaireService.getAllCvs();
        return ResponseEntity.ok(cvs);
    }

    @GetMapping("/getCandidatures")
    public ResponseEntity<ReturnEntityDTO<List<EtudiantCandidaturesDTO>>> getAllEtudiantsCandidatures(@RequestParam(required = false) String year) {
        try {
            List<EtudiantCandidaturesDTO> etudiants = gestionnaireService.getAllEtudiantsCandidatures(year);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Trouvés", etudiants));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ReturnEntityDTO<>("Erreur interne du serveur", null));
        }
    }

    @GetMapping("/notifications/all")
    public ResponseEntity<ReturnEntityDTO<NotificationsResponseDTO>> getAllNotifications() {
        try {
            NotificationsResponseDTO notifications = gestionnaireService.getGestionnaireNotifications();
            return ResponseEntity.ok(new ReturnEntityDTO<>("notifications: ", notifications));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la récupération des notifications", null));
        }
    }

    @PutMapping("/notifications/read/{id}")
    public ResponseEntity<ReturnEntityDTO<Void>> markNotificationAsRead(@PathVariable Long id) {
        try {
            gestionnaireService.markNotificationAsRead(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors du marquage de la notification comme lue", null));
        }
    }

    @PostMapping("/candidatures/{candidatureId}/generer-entente")
    public ResponseEntity<ReturnEntityDTO<EntenteDTO>> genererEntente(@PathVariable Long candidatureId) {
        try {
            EntenteDTO entente = gestionnaireService.genererEntente(candidatureId);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Entente générée avec succès", entente));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ReturnEntityDTO<>(e.getMessage(), null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la génération de l'entente", null));
        }
    }
}