package com.AL565.prose.controller;

import com.AL565.prose.security.exceptions.AuthenticationException;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.UtilisateurService;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.dto.ReturnEntityDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.CandidatureNotFoundException;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.InvalidCandidatureModificationException;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@AllArgsConstructor
@RestController
@RequestMapping("/employeur")
public class EmployeurController {

    private EmployeurService employeurService;
    private final UtilisateurService utilisateurService;

    private final JwtTokenProvider jwtTokenProvider;


    @PostMapping("/register")
    public ResponseEntity<String> enregistrer(@RequestBody EmployeurPasswordDTO employeurPasswordDTO) {
        try {
            employeurService.enregistrer(employeurPasswordDTO);
            return new ResponseEntity<>("Created", HttpStatus.CREATED);
        } catch (EmailAlreadyExistsException e) {
            return new ResponseEntity<>("Le email est déja en cours d'utilisation.", HttpStatus.CONFLICT);
        } catch (Exception e) {
            return new ResponseEntity<>("Service temporairement indisponible.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/createStage")
    public ResponseEntity<String> createOffer(@Valid @RequestBody StageDTO request) {
        try {
            employeurService.createStage(request);
            return new ResponseEntity<>("Stage créé avec succès", HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Stage invalide",  HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Service temporairement indisponible.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{email:.+}/stages")
    public ResponseEntity<ReturnEntityDTO<List<StageDTO>>> listPublishedByEmployerEmail(@PathVariable("email") String email, @RequestParam(required = false) String year) {
        try {
            List<StageDTO> stages = employeurService.listStagesFor(email, year);
            if (stages.isEmpty()) {
                return ResponseEntity.ok().body(new ReturnEntityDTO<>("Aucun stage publié trouvé pour cet employeur", new ArrayList<>() {
                }));
            }
            return ResponseEntity.ok(new ReturnEntityDTO<>("Trouvés", stages));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ReturnEntityDTO<>("Utilisateur n'est pas un employeur", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ReturnEntityDTO<>("Erreur lors de la récupération des stages publiés", null));
        }
    }

    @GetMapping("/stages/{id}/applications")
    public ResponseEntity<ReturnEntityDTO<List<CandidatureDTO>>> getStageCandidatures(@PathVariable long id) {
        try {
            List<CandidatureDTO> candidatures = employeurService.getStageCandidatures(id);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Candidatures trouvées", candidatures));
        } catch (NoSuchElementException e) {
            return ResponseEntity.ok(new ReturnEntityDTO<>("Aucune candidature trouvee", new ArrayList<>()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ReturnEntityDTO<>("Erreur interne du serveur", null));
        }
    }

    @PutMapping("/candidatures/{id}/update")
    public ResponseEntity<String> changeStatus(@PathVariable long id, @RequestParam String status) {
        try {
            employeurService.updateCandidatureStatus(id, status);
            return ResponseEntity.ok("Candidature mise à jour avec succès");
        } catch (CandidatureNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("La candidature n'existe pas");
        } catch (InvalidCandidatureModificationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur interne lors de la mise à jour de la candidature : " + e.getMessage());
        }
    }

    @GetMapping("/notifications/all")
    public ResponseEntity<ReturnEntityDTO<NotificationsResponseDTO>> getPostulationNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtTokenProvider.getEmailFromJWT(token);
            NotificationsResponseDTO notifications = employeurService.getEmployeurNotifications(email);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Notifications: ", notifications));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la récupération des notifications", null));
        }
    }

    @PutMapping("/notifications/read/{id}")
    public ResponseEntity<ReturnEntityDTO<Void>> markNotificationAsRead(@PathVariable Long id) {
        try {
            employeurService.markNotificationAsRead(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors du marquage de la notification comme lue", null));
        }
    }

    @PutMapping("/candidatures/{id}/convoquer")
    public ResponseEntity<ReturnEntityDTO<Void>> convoquerEntrevue(@PathVariable long id, @RequestBody InterviewDTO interviewDTO) {
        try {
            employeurService.convoquerEntrevue(id, interviewDTO);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Convocation réussie", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la convocation de l'entrevue", null));
        }
    }

    @GetMapping("/candidatures/{candidatureId}/entente")
    public ResponseEntity<ReturnEntityDTO<EntenteDTO>> getEntente(@PathVariable Long candidatureId,
                                                                  @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String callerEmail = jwtTokenProvider.getEmailFromJWT(token);
            EntenteDTO entente = utilisateurService.getEntenteByCandidatureId(candidatureId, callerEmail);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Entente trouvée", entente));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ReturnEntityDTO<>(e.getMessage(), null));
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
            
            utilisateurService.signEntente(request, ententeId, email);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Entente signée avec succès", null));
        } catch (AuthenticationException e) {
            return  ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ReturnEntityDTO<>("Le mot de passe est invalide", null));
        } catch (UserNotFoundException e) {
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ReturnEntityDTO<>("L'utilisateur n'existe pas", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ReturnEntityDTO<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur interne du serveur lors de la signature de l'entente", null));
        }
    }

    @PostMapping("/{employeurId}/evaluate")
    public ResponseEntity<EvaluationDTO> createEvaluation(
            @PathVariable Long employeurId,
            @RequestBody EvaluationDTO evaluationDTO) {
        try {
            EvaluationDTO createdEvaluation = employeurService.createEvaluation(employeurId, evaluationDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvaluation);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/{employeurId}/evaluation/{ententeId}")
    public ResponseEntity<EvaluationDTO> getEvaluationByEntente(
            @PathVariable Long employeurId,
            @PathVariable Long ententeId) {
        try {
            EvaluationDTO evaluation = employeurService.getEvaluationByEntente(employeurId, ententeId);
            return ResponseEntity.ok(evaluation);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{employeurId}/ententes")
    public ResponseEntity<List<EntenteDTO>> getEntentesNeedingEvaluation(
            @PathVariable Long employeurId,
            @RequestParam(required = false) String year) {
        try {
            List<EntenteDTO> ententes = employeurService.getEntentesNeedingEvaluation(employeurId, year);
            return ResponseEntity.ok(ententes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
