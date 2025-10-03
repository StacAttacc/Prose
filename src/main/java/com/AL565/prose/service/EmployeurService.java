package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.service.dto.EmployeurDTO;
import com.AL565.prose.service.dto.EmployeurEnregistrerDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class EmployeurService {
    private ProseUserRepository proseUserRepository;
    private EmployeurRepository employeurRepository;
    private PasswordEncoder passwordEncoder;
    private StageRepository stageRepository;

    public void enregistrer(EmployeurEnregistrerDTO employeurDTO) throws EmailAlreadyExistsException {
        if (proseUserRepository.findByCredentials_Username(employeurDTO.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Le email de l'employeur est déja en utilisation.");
        }

        employeurDTO.setPassword(passwordEncoder.encode(employeurDTO.getPassword()));
        employeurRepository.save(EmployeurEnregistrerDTO.toModel(employeurDTO));
    }

    public EmployeurDTO getEmployeur(String email) {
        return EmployeurDTO.toDTO((Employeur) proseUserRepository.findByCredentials_Username(email).orElseThrow());
    }


    @Transactional
    public StageDTO createStage(Employeur employeur, StageDTO dto) {
        if (employeur == null) {
            throw new IllegalArgumentException("employeur must not be null");
        }
        if (dto == null) {
            throw new IllegalArgumentException("dto must not be null");
        }

        Stage toSave = StageDTO.toModel(dto, employeur);
        Stage saved = stageRepository.save(toSave);
        return StageDTO.fromModel(saved);
    }


    public List<StageDTO> listStagesFor(Employeur employeur) {
        return stageRepository.findByEmployeur_Id(employeur.getId())
                .stream().map(StageDTO::fromModel).toList();
    }

    public List<StageDTO> listPublishedByEmployerEmail(String email) {
        return stageRepository
                .findByEmployeur_Credentials_UsernameAndStatus(email)
                .stream()
                .map(StageDTO::fromModel)
                .toList();
    }

}
