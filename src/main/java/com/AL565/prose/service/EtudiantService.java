package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.EtudiantRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final ProseUserRepository proseUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final StageRepository stageRepository;
    private final EmployeurRepository employeurRepository;

    public EtudiantService(EtudiantRepository etudiantRepository,
                           ProseUserRepository proseUserRepository,
                           PasswordEncoder passwordEncoder,
                           StageRepository stageRepository,
                           EmployeurRepository employeurRepository) {
        this.etudiantRepository = etudiantRepository;
        this.proseUserRepository = proseUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.employeurRepository = employeurRepository;
        this.stageRepository = stageRepository;
    }

    public void inscrireEtudiant(EtudiantPasswordDTO dto) {
        if (proseUserRepository.findByCredentials_Username(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }

        dto.setPassword(passwordEncoder.encode(dto.getPassword()));

        Etudiant etudiant = EtudiantPasswordDTO.toModel(dto);

        etudiantRepository.save(etudiant);
    }

    public List<StageDTO> getEtudiantStages(String token) {
        return stageRepository.findByStatus(OfferStatus.APPROUVEE)
                .stream()
                .map(stage -> {
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                    return StageDTO.fromModel(stage, employeur);
                })
                .collect(Collectors.toList());
    }
}
