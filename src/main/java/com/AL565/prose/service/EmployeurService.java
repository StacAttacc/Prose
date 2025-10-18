package com.AL565.prose.service;

import com.AL565.prose.model.Candidature;
import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.StageNotification;
import com.AL565.prose.repository.CandidatureRepository;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.NotificationRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.security.exceptions.NotificationExceptions.*;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.EmployeurDTO;
import com.AL565.prose.service.dto.EmployeurPasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.StageNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class EmployeurService {
    private ProseUserRepository proseUserRepository;
    private EmployeurRepository employeurRepository;
    private PasswordEncoder passwordEncoder;
    private StageRepository stageRepository;
    private NotificationRepository notificationRepository;
    private CandidatureRepository candidatureRepository;

    public void enregistrer(EmployeurPasswordDTO employeurDTO) throws EmailAlreadyExistsException {
        if (proseUserRepository.findByCredentials_Username(employeurDTO.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Le email de l'employeur est déja en utilisation.");
        }

        employeurDTO.setPassword(passwordEncoder.encode(employeurDTO.getPassword()));
        employeurRepository.save(EmployeurPasswordDTO.toModel(employeurDTO));
    }

    public EmployeurDTO getEmployeur(String email) {
        return EmployeurDTO.toDTOTokenless((Employeur) proseUserRepository.findByCredentials_Username(email).orElseThrow((UserNotFoundException::new)));
    }


    @Transactional
    public StageDTO createStage(StageDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("stage must not be null");
        }

        Stage saved = stageRepository.save(StageDTO.toModel(dto));
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(saved.getEmployeurEmail());
        createNotificationForNewStage(saved);

        return StageDTO.fromModel(saved, employeur);
    }

    private void createNotificationForNewStage(Stage stage) {
        if (stage == null) {
            throw new IllegalArgumentException("stage must not be null");
        }
        StageNotification notification = new StageNotification();
        notification.setReadAt(null);
        notification.setCreatedAt(OffsetDateTime.now().toLocalDateTime());
        notification.setStage(stage);
        notification.setSenderEmail(stage.getEmployeurEmail());
        notification.setType(NotificationType.STAGE_NOTIFICATION);
        notification.setMessage(stage.getTitle());
        notificationRepository.save(notification);
    }

    @Transactional
    public List<StageDTO> listStagesFor(String email) {
        return stageRepository.findByEmployeurEmail(email)
                .stream().map((stage) -> {
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                    return StageDTO.fromModel(stage, employeur);
                }).toList();
    }

    public StageDTO updateStage(Long id, StageDTO stageDTO) throws StageNotFoundException {
        Stage stage = stageRepository.findById(id)
                .orElseThrow(() -> new StageNotFoundException("Stage non trouvé"));

        stage.setTitle(stageDTO.getTitle());
        stage.setDescription(stageDTO.getDescription());
        stage.setRequirements(stageDTO.getRequirements());
        stage.setSkills(stageDTO.getSkills());
        stage.setStartDate(stageDTO.getStartDate());
        stage.setEndDate(stageDTO.getEndDate());
        stage.setLocation(stageDTO.getLocation());
        stage.setWorkMode(stageDTO.getWorkMode());
        stage.setCompensation(stageDTO.getCompensation());
        stage.setRejectionReason(null);
        stage.setStatus(OfferStatus.SOUMISE);
        stage.setUpdatedAt(OffsetDateTime.now());
        Stage updatedStage = stageRepository.save(stage);
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(updatedStage.getEmployeurEmail());
        return StageDTO.fromModel(updatedStage, employeur);
    }

    @Transactional
    public List<CandidatureDTO> getStageCandidatures(long stageId) throws StageNotFoundException {
        if (stageRepository.findById(stageId).isEmpty()) {
            throw new StageNotFoundException("Le stage n'existe pas");
        }
        List<Candidature> candidatures = candidatureRepository.findAllByStage_Id(stageId).orElse(new ArrayList<>());

        return candidatures.stream().map((CandidatureDTO::toDTO)).toList();
    }
}
