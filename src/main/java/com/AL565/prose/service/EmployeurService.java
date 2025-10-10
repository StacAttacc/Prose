package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.StageNotification;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.NotificationRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.security.exceptions.NotificationExceptions.*;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.dto.EmployeurDTO;
import com.AL565.prose.service.dto.EmployeurPasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@AllArgsConstructor
public class EmployeurService {
    private ProseUserRepository proseUserRepository;
    private EmployeurRepository employeurRepository;
    private PasswordEncoder passwordEncoder;
    private StageRepository stageRepository;
    private NotificationRepository notificationRepository;

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
            throw new IllegalArgumentException("dto must not be null");
        }

        Stage saved = stageRepository.save(StageDTO.toModel(dto));
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(saved.getEmployeurEmail());

        return StageDTO.fromModel(saved, employeur);
    }

    @Transactional
    public void createNotificationForNewStage(StageDTO stageDTO) {
        if (stageDTO == null) {
            throw new IllegalArgumentException("stageDTO must not be null");
        }
        Stage stage = StageDTO.toModel(stageDTO);
        StageNotification notification = new StageNotification();
        notification.setCreatedAt(OffsetDateTime.now().toLocalDateTime());
        notification.setStage(stage);
        notification.setSenderEmail(stage.getEmployeurEmail());
        notification.setType(NotificationType.STAGE_NOTIFICATION);
        notification.setMessage("Nouvelle offre de stage soumise");
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

    public StageDTO updateStage(Long id, StageDTO stageDTO) {
        Stage stage = stageRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Stage non trouvé"));

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
}
