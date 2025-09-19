package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.service.DTO.EmployeurDTO;
import com.AL565.prose.service.DTO.EmployeurEnregistrerDTO;
import com.AL565.prose.service.exceptions.EmailEnUtilisationException;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class EmployeurService {
    private ProseUserRepository proseUserRepository;
    private EmployeurRepository employeurRepository;
    private PasswordEncoder passwordEncoder;

    public void enregistrer(EmployeurEnregistrerDTO employeurDTO) throws EmailEnUtilisationException {
        if (proseUserRepository.findByCredentials_Username(employeurDTO.getEmail()).isPresent()) {
            throw new EmailEnUtilisationException("Le email de l'employeur est déja en utilisation.");
        }

        employeurDTO.setPassword(passwordEncoder.encode(employeurDTO.getPassword()));
        employeurRepository.save(EmployeurEnregistrerDTO.toModel(employeurDTO));
    }

    public EmployeurDTO getEmployeur(String email) {
        return EmployeurDTO.toDTO((Employeur) proseUserRepository.findByCredentials_Username(email).orElseThrow());
    }
}
