package com.AL565.prose.controller;

import com.AL565.prose.repository.GestionnaireRepository;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.GestionnaireService;
import com.AL565.prose.service.UtilisateurService;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EtudiantAlreadyAssociatedException;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/gestionnaire")
@RequiredArgsConstructor
public class GestionnaireController {

    private final GestionnaireService gestionnaireService;
    private final UtilisateurService utilisateurService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final GestionnaireRepository gestionnaireRepository;

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
    public ResponseEntity<List<GestionnaireCvDTO>> getAllCvs(@RequestParam(required = false) String year) throws Exception {
        List<GestionnaireCvDTO> cvs = gestionnaireService.getAllCvs(year);
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur interne du serveur lors de la génération de l'entente", null));
        }
    }

    @GetMapping("/candidatures/{candidatureId}/entente")
    public ResponseEntity<ReturnEntityDTO<EntenteDTO>> getEntente(@PathVariable Long candidatureId) {
        try {
            EntenteDTO entente = utilisateurService.getEntenteByCandidatureId(candidatureId);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Entente trouvée", entente));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ReturnEntityDTO<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la récupération de l'entente", null));
        }
    }

    @PutMapping("/ententes/{ententeId}/signer")
    public ResponseEntity<ReturnEntityDTO<String>> signEntente(
            @PathVariable Long ententeId,
            @RequestBody SignEntenteRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtTokenProvider.getEmailFromJWT(token);
            
            // Vérifier le mot de passe
            var gestionnaireOpt = gestionnaireRepository.findByCredentials_Username(email);
            if (gestionnaireOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ReturnEntityDTO<>("Gestionnaire non trouvé", null));
            }
            if (!passwordEncoder.matches(request.getPassword(), gestionnaireOpt.get().getCredentials().getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ReturnEntityDTO<>("Mot de passe incorrect", null));
            }
            
            utilisateurService.signEntente(ententeId, email);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Entente signée avec succès", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ReturnEntityDTO<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur interne du serveur lors de la signature de l'entente", null));
        }
    }

    @PostMapping("/associate-professeur")
    public ResponseEntity<String> associateProfesseur(@RequestBody ProfesseurAssociationDTO association) {
        try {
            gestionnaireService.associateProfesseurToEtudiant(association);
            return ResponseEntity.ok("Association réussie");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Un des utilisateurs n'existe pas");
        } catch(EtudiantAlreadyAssociatedException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Etudiant already associated");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur interne du serveur");
        }
    }

    @PostMapping("/professeurs/create")
    public ResponseEntity<ReturnEntityDTO<String>> createProfesseur(@RequestBody ProfesseurPasswordDTO professeurDTO) {
        try {
            gestionnaireService.createProfesseur(professeurDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ReturnEntityDTO<>("Professeur créé avec succès", null));
        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ReturnEntityDTO<>("Un compte avec cet email existe déjà", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ReturnEntityDTO<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la création du professeur", null));
        }
    }

    @PostMapping("/stages/assign")
    public ResponseEntity<ReturnEntityDTO<CandidatureDTO>> assignStageToStudent(@RequestBody AssignStageDTO assignStageDTO) {
        try {
            CandidatureDTO candidature = gestionnaireService.assignStageToStudent(assignStageDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ReturnEntityDTO<>("Stage attribué à l'étudiant avec succès", candidature));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ReturnEntityDTO<>(e.getMessage(), null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ReturnEntityDTO<>("Stage non trouvé", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de l'attribution du stage", null));
        }
    }

    @GetMapping("/etudiants/all")
    public ResponseEntity<ReturnEntityDTO<List<EtudiantDTO>>> getAllEtudiants() {
        try {
            List<EtudiantDTO> etudiants = gestionnaireService.getAllEtudiants();
            return ResponseEntity.ok(new ReturnEntityDTO<>("Liste des étudiants", etudiants));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la récupération des étudiants", null));
        }
    }

    @GetMapping("/professeurs/all")
    public ResponseEntity<ReturnEntityDTO<List<ProfesseurDTO>>> getAllProfesseurs() {
        try {
            List<ProfesseurDTO> professeurs = gestionnaireService.getAllProfesseurs();
            return ResponseEntity.ok(new ReturnEntityDTO<>("Liste des professeurs", professeurs));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la récupération des professeurs", null));
        }
    }
}