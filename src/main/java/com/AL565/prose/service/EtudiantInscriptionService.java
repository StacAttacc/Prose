package com.AL565.prose.service;

import com.AL565.prose.service.dto.*;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.service.exception.EmailAlreadyExistsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EtudiantInscriptionService {

    private final EtudiantRepository etudiantRepository;
    private final ProseUserRepository proseUserRepository;
    private final PasswordEncoder passwordEncoder;

    public EtudiantInscriptionService(EtudiantRepository etudiantRepository,
                                      ProseUserRepository proseUserRepository,
                                      PasswordEncoder passwordEncoder) {
        this.etudiantRepository = etudiantRepository;
        this.proseUserRepository = proseUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void inscrireEtudiant(EtudiantDto dto) {
        if (proseUserRepository.findByCredentials_Username(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }

        Etudiant etudiant = dto.toModel(passwordEncoder);

        etudiantRepository.save(etudiant);
    }
}
