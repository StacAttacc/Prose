package com.AL565.prose.controller;


import com.AL565.prose.service.dto.EmployeurEnregistrerDTO;
import com.AL565.prose.service.EmployeurService;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/employeur")
public class EmployeurControler {

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
}
