package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.GestionnaireRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.service.dto.GestionnaireDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class GestionnaireService {

    private final GestionnaireRepository gestionnaireRepository;
    private final StageRepository stageRepository;
    private final EmployeurRepository employeurRepository;
    private final PasswordEncoder passwordEncoder;

    public void saveGestionnaire(GestionnaireDTO gestionnaire) {
        try {
            gestionnaireRepository.save(GestionnaireDTO.toModel(gestionnaire, passwordEncoder));
        } catch (Exception e) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }
    }

    public List<StageDTO> getStagesByStatus(String status) {
        return stageRepository.findByStatus(OfferStatus.valueOf(status))
                .stream()
                .map(stage -> {
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                    return StageDTO.fromModel(stage, employeur);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public StageDTO approuverStage(Long stageId) {
        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new NoSuchElementException("Stage non trouvé"));

        stage.setStatus(OfferStatus.APPROUVEE);
        Stage updatedStage = stageRepository.save(stage);

        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(updatedStage.getEmployeurEmail());

        return StageDTO.fromModel(updatedStage, employeur);
    }

    @Transactional
    public StageDTO rejeterStage(Long stageId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("La raison du rejet est obligatoire");
        }

        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new NoSuchElementException("Stage non trouvé"));

        stage.setStatus(OfferStatus.REJETEE);
        stage.setRejectionReason(reason);
        Stage updatedStage = stageRepository.save(stage);

        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(updatedStage.getEmployeurEmail());

        return StageDTO.fromModel(updatedStage, employeur);
    }
}