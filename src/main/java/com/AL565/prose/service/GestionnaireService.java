package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.CvStatus;
import com.AL565.prose.model.notifications.Notification;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.StageNotification;
import com.AL565.prose.security.exceptions.NotificationExceptions.*;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.exceptions.CvExceptions.*;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import com.AL565.prose.service.dto.GestionnairePasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.dto.notifications.NotificationGroupDTO;
import com.AL565.prose.service.dto.notifications.NotificationSummaryDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.FailedToRetrieveStagesException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class GestionnaireService {

    private final CvRepository cvRepository;
    private final GestionnaireRepository gestionnaireRepository;
    private final StageRepository stageRepository;
    private final EmployeurRepository employeurRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationRepository notificationRepository;
    private final NotificationsHelper notificationsHelper;

    public void saveGestionnaire(GestionnairePasswordDTO dto) {
        if (gestionnaireRepository.findByCredentials_Username(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }

        dto.setPassword(passwordEncoder.encode(dto.getPassword()));

        gestionnaireRepository.save(GestionnairePasswordDTO.toModel(dto));
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

    public NotificationsResponseDTO getStageNotifications() throws Exception {
        try {
            List<NotificationGroupDTO> groups = new ArrayList<>();
            int total = 0;
            for (NotificationType t : NotificationType.values()) {
                List<Notification> list = notificationRepository.findNotificationsByTypeAndReadAt(t, null);
                if (list != null && !list.isEmpty()) {
                    List<NotificationSummaryDTO> items = list.stream()
                            .map(this::toSummary)
                            .collect(Collectors.toList());
                    groups.add(new NotificationGroupDTO(t.getDisplayName(), items, items.size()));
                    total += items.size();
                }
            }
            return new NotificationsResponseDTO(groups, total);
        } catch (Exception e) {
            throw new NotificationFetchException();
        }
    }

    private NotificationSummaryDTO toSummary(Notification n) {
        Long stageId = null;
        Long candidatureId = null;
        if (n instanceof StageNotification) {
            if (((StageNotification) n).getStage() != null) {
                stageId = ((StageNotification) n).getStage().getId();
            }
        } else {
            // other notification subclass handling can be added here if needed
        }

        return NotificationSummaryDTO.builder()
                .id(n.getId())
                .type(n.getType() != null ? n.getType().getDisplayName() : null)
                .message(n.getMessage())
                .senderEmail(n.getSenderEmail())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .stageId(stageId)
                .candidatureId(candidatureId)
                .build();
    }

    public void markNotificationAsRead(Long notificationId) throws Exception {
        notificationsHelper.markNotificationAsRead(notificationId);
    }
}
