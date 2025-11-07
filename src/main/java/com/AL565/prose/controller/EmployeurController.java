package com.AL565.prose.controller;

import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.EntenteService;
import com.AL565.prose.service.dto.ReturnEntityDTO;
import com.AL565.prose.service.dto.StageDTO;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.service.exceptions.CandidatureNotFoundException;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.InvalidCandidatureModificationException;
import com.AL565.prose.service.exceptions.StageNotFoundException;
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
    private final EntenteService ententeService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmployeurRepository employeurRepository;


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
    public ResponseEntity<ReturnEntityDTO<List<StageDTO>>> listPublishedByEmployerEmail(@PathVariable("email") String email) {
        try {
            List<StageDTO> stages = employeurService.listStagesFor(email);
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

    @PutMapping("/stages/{id}")
    public ResponseEntity<ReturnEntityDTO<StageDTO>> updateStage(@PathVariable("id") Long id, @Valid @RequestBody StageDTO stageDTO) {
        try {
            StageDTO updatedStage = employeurService.updateStage(id, stageDTO);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Stage mis à jour avec succès", updatedStage));
        } catch (StageNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ReturnEntityDTO<>("Stage non trouvé", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ReturnEntityDTO<>("Erreur lors de la mise à jour du stage", null));
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
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur interne lors de la mise à jour de la candidature : " + e.getMessage());
        }
    }

    @GetMapping("/notifications/postulations/{email}")
    public ResponseEntity<ReturnEntityDTO<NotificationsResponseDTO>> getPostulationNotifications(@PathVariable String email) {
        try {
            NotificationsResponseDTO notifications = employeurService.getPostulationNotifications(email);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Notifications: ", notifications));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur lors de la récupération des notifications de postulation", null));
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
    public ResponseEntity<ReturnEntityDTO<EntenteDTO>> getEntente(@PathVariable Long candidatureId) {
        try {
            EntenteDTO entente = ententeService.getEntenteByCandidatureId(candidatureId);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Entente trouvée", entente));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ReturnEntityDTO<>(e.getMessage(), null));
        } catch (Exception e) {
            e.printStackTrace();
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
            var employeurEntity = employeurRepository.getEmployeurByCredentials_Username(email);
            if (employeurEntity == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ReturnEntityDTO<>("Employeur non trouvé", null));
            }
            if (!passwordEncoder.matches(request.getPassword(), employeurEntity.getCredentials().getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ReturnEntityDTO<>("Mot de passe incorrect", null));
            }
            
            ententeService.signEntente(ententeId, email);
            return ResponseEntity.ok(new ReturnEntityDTO<>("Entente signée avec succès", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ReturnEntityDTO<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ReturnEntityDTO<>("Erreur interne du serveur lors de la signature de l'entente", null));
        }
    }

}
