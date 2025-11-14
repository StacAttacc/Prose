package com.AL565.prose.service;

import com.AL565.prose.repository.ProfesseurRepository;
import com.AL565.prose.service.dto.ProfesseurPasswordDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ProfesseurService {
    private ProfesseurRepository professeurRepository;

    private PasswordEncoder passwordEncoder;

    public void register(ProfesseurPasswordDTO professeur) {
        if (professeurRepository.findByCredentials_Username(professeur.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Le professeur existe déja");
        }

        professeur.setPassword(passwordEncoder.encode(professeur.getPassword()));
        professeurRepository.save(ProfesseurPasswordDTO.toModel(professeur));
    }
}
