package com.AL565.prose.controller;


import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.dto.EmployeurEnregistrerDTO;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/employeur")
public class EmployeurController {

    private EmployeurService employeurService;

    @PostMapping("/register")
    public ResponseEntity<String> enregistrer(@RequestBody EmployeurEnregistrerDTO employeurEnregistrerDTO) {
        try {
            employeurService.enregistrer(employeurEnregistrerDTO);
            return new ResponseEntity<>("Created", HttpStatus.CREATED);
        } catch (EmailAlreadyExistsException e) {
            return new ResponseEntity<>("Le email est déja en cours d'utilisation.", HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/createStage")
    public ResponseEntity<String> createOffer(@Valid @RequestBody StageDTO request) {
        try {
            employeurService.createStage(request);
            return new ResponseEntity<>("Stage créé avec succès", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Erreur lors de la création du stage", HttpStatus.BAD_REQUEST);
        }
    }


    @GetMapping("/{email:.+}/stages")
    public ResponseEntity<?> listPublishedByEmployerEmail(@PathVariable("email") String email) {
        try {
            List<StageDTO> stages = employeurService.listStagesFor(email);
            if (stages.isEmpty()) {
                return new ResponseEntity<>("Aucun stage publié trouvé pour cet employeur", HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(stages, HttpStatus.OK);
        } catch (UserNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>("Erreur lors de la récupération des stages publiés", HttpStatus.BAD_REQUEST);
        }
    }
}

