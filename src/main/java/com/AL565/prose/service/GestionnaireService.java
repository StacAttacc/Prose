package com.AL565.prose.service;

import com.AL565.prose.model.CV;
import com.AL565.prose.model.CvStatus;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.repository.CvRepository;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.GestionnaireRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.security.exceptions.CvExceptions.*;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import com.AL565.prose.service.dto.GestionnairePasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.FailedToRetrieveStagesException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class GestionnaireService {

    private final CvRepository cvRepository;

    private final GestionnaireRepository gestionnaireRepository;
    private final StageRepository stageRepository;
    private final EmployeurRepository employeurRepository;
    private final PasswordEncoder passwordEncoder;

    public void saveGestionnaire(GestionnairePasswordDTO dto) {
        if (gestionnaireRepository.findByCredentials_Username(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }

        dto.setPassword(passwordEncoder.encode(dto.getPassword()));

        gestionnaireRepository.save(GestionnairePasswordDTO.toModel(dto));
    }


    public List<GestionnaireCvDTO> getAllCvs() throws Exception {
        try {
            return cvRepository.findAll()
                    .stream()
                    .map(GestionnaireCvDTO::toDto)
                    .toList();
        } catch (Exception e) {
            throw new FailedToFetchCvsException();
        }
    }

    public void changeCvStatus(Long cvId, String status, String comment) throws Exception {
        try {
            CV cv = cvRepository.findById(cvId).orElseThrow(CvNotFoundException::new);
            cv.setStatus(CvStatus.valueOf(status.toUpperCase()));
            cv.setComment(comment);
            cvRepository.save(cv);
        } catch (Exception e) {
            throw new FailedToChangeCvStatusException();
        }
    }

    public List<StageDTO> getAllStages() throws FailedToRetrieveStagesException {
        try {
            return stageRepository.findAll().stream().map(stage -> {
                Employeur emp = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                return StageDTO.fromModel(stage, emp);
            }).toList();
        } catch (Exception e) {
            throw new FailedToRetrieveStagesException("Échec lors de la récupération des stages.", e);
        }
    }
}


