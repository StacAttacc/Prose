package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.CvStatus;
import com.AL565.prose.model.notifications.Notification;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.PostulationNotification;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.exceptions.CvExceptions.*;
import com.AL565.prose.service.dto.GestionnaireCvDTO;
import com.AL565.prose.service.dto.GestionnairePasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.dto.notifications.NotificationGroupDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.FailedToRetrieveStagesException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
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
    private final PostulationNotificationRepository postulastionNotificationRepository;
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

    public NotificationsResponseDTO getGestionnaireNotifications() throws Exception {
        try {
                List<Notification> stages = notificationRepository
                        .findNotificationsByTypeAndFirstRecipientReadAt(NotificationType.STAGE_NOTIFICATION, null);
                List<PostulationNotification> postulations = postulastionNotificationRepository
                        .findBySecondRecipientReadAt(null);

                NotificationGroupDTO stagesGroup = NotificationGroupDTO
                        .toDTO(NotificationType.STAGE_NOTIFICATION.getDisplayName(), stages);
                NotificationGroupDTO postulationGroup = NotificationGroupDTO
                        .toDTO(NotificationType.POSTULATION_NOTIFICATION.getDisplayName(), postulations);

            return NotificationsResponseDTO.toDTO(List.of(stagesGroup, postulationGroup));
        } catch (Exception e) {
            throw new NotificationExceptions.NotificationFetchException();
        }
    }

    public void markNotificationAsReadByFirstRecipient(Long notificationId) throws Exception {
        notificationsHelper.markNotificationAsReadByFirstRecipient(notificationId);
    }

    public void markPostulationAsReadBySecondRecipient(Long notificationId) throws Exception {
        try {
            PostulationNotification notification = postulastionNotificationRepository.findById(notificationId)
                    .orElseThrow(NotificationExceptions.NotificationFetchException::new);
            notification.setSecondRecipientReadAt(OffsetDateTime.now().toLocalDateTime());
            notificationRepository.save(notification);
        } catch (Exception e) {
            throw new NotificationExceptions.NotificationFetchException();
        }
    }
}
