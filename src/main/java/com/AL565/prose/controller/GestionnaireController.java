package com.AL565.prose.controller;

import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.dto.*;
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
    public ResponseEntity<ReturnEntityDTO<List<StageDTO>>> getAllStages() {
        try {
            List<StageDTO> stages = gestionnaireService.getAllStages();
            return ResponseEntity.ok(new ReturnEntityDTO<>("Liste des stages", stages));
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ReturnEntityDTO<>("Erreur lors de la récupération des stages", null));
        }
    }

    @GetMapping("/stages/status/{status}")
    public ResponseEntity<ReturnEntityDTO<List<StageDTO>>> getStagesByStatus(@PathVariable String status) {
        try {
            List<StageDTO> stages = gestionnaireService.getStagesByStatus(status);
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
    public ResponseEntity<ReturnEntityDTO<List<EtudiantCandidaturesDTO>>> getAllEtudiantsCandidatures() {
        try {
            List<EtudiantCandidaturesDTO> etudiants = gestionnaireService.getAllEtudiantsCandidatures();
            return ResponseEntity.ok(new ReturnEntityDTO<>("Trouvés", etudiants));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ReturnEntityDTO<>("Erreur interne du serveur", null));
        }
    }

    @GetMapping("/notifications/all")
    public ResponseEntity<ReturnEntityDTO<StageNotificationDTO>> getAllNotifications() {
        try {
            StageNotificationDTO notifications = gestionnaireService.getStageNotifications();
            return ResponseEntity.ok(new ReturnEntityDTO<>("notifications: ", notifications));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la récupération des notifications", null));
        }
    }

    @PutMapping("notifications/read/{id}")
    public ResponseEntity<ReturnEntityDTO<Void>> markNotificationAsRead(@PathVariable Long id) {
        try {
            gestionnaireService.markNotificationAsRead(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors du marquage de la notification comme lue", null));
        }
    }
}
