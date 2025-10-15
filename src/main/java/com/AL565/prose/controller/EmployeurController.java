package com.AL565.prose.controller;


import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.EmployeurPasswordDTO;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.dto.ReturnEntityDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
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

    @PostMapping("/register")
    public ResponseEntity<String> enregistrer(@RequestBody EmployeurPasswordDTO employeurPasswordDTO) {
        try {
            employeurService.enregistrer(employeurPasswordDTO);
            return new ResponseEntity<>("Created", HttpStatus.CREATED);
        } catch (EmailAlreadyExistsException e) {
            return new ResponseEntity<>("Le email est déja en cours d'utilisation.", HttpStatus.BAD_REQUEST);
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
        }catch (Exception e) {
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
}
