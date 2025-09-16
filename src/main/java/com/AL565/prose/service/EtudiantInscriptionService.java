package com.AL565.prose.service;

import com.AL565.prose.service.dto.EtudiantInscriptionDto;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Etudiant;
import com.AL565.prose.model.auth.Role;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.security.exception.EmailAlreadyExistsException;
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

    public EtudiantInscriptionDto inscrireEtudiant(EtudiantInscriptionDto dto) {
        // Vérifier si l'email existe déjà
        if (proseUserRepository.findByCredentials_Username(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }

        // Créer l'étudiant (model pour BD)
        Etudiant etudiant = new Etudiant();
        etudiant.setFirstName(dto.getFirstName());
        etudiant.setLastName(dto.getLastName());
        etudiant.setDiscipline(dto.getDiscipline());

        // Créer les credentials
        Credentials credentials = Credentials.builder()
                .username(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.ETUDIANT)
                .build();

        etudiant.setCredentials(credentials);

        // Sauvegarder en BD
        Etudiant savedEtudiant = etudiantRepository.save(etudiant);

        // Retourner le même DTO (sans le mot de passe pour la sécurité)
        EtudiantInscriptionDto responseDto = new EtudiantInscriptionDto();
        responseDto.setFirstName(savedEtudiant.getFirstName());
        responseDto.setLastName(savedEtudiant.getLastName());
        responseDto.setEmail(savedEtudiant.getEmail());
        responseDto.setDiscipline(savedEtudiant.getDiscipline());
        // Ne pas retourner le mot de passe
        responseDto.setPassword(null);

        return responseDto;
    }
}