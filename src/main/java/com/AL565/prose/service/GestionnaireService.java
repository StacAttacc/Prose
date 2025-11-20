package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.notifications.*;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.exceptions.CvExceptions.*;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.dto.notifications.NotificationGroupDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.EtudiantAlreadyAssociatedException;
import com.AL565.prose.service.exceptions.FailedToRetrieveStagesException;

import com.AL565.prose.utils.NotificationsHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import static com.AL565.prose.model.notifications.NotificationType.*;

@Service
@Transactional
@RequiredArgsConstructor
public class GestionnaireService {

    private final CvRepository cvRepository;
    private final GestionnaireRepository gestionnaireRepository;
    private final StageRepository stageRepository;
    private final EmployeurRepository employeurRepository;
    private final EtudiantRepository etudiantRepository;
    private final ProfesseurRepository professeurRepository;
    private final PasswordEncoder passwordEncoder;
    private final CandidatureRepository candidatureRepository;
    private final NotificationRepository notificationRepository;
    private final SignatureEntenteNotificationRepository signatureEntenteNotificationRepository;
    private final NotificationsHelper notificationsHelper;

    public void saveGestionnaire(GestionnairePasswordDTO dto) {
        if (gestionnaireRepository.findByCredentials_Username(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }

        dto.setPassword(passwordEncoder.encode(dto.getPassword()));

        gestionnaireRepository.save(GestionnairePasswordDTO.toModel(dto));
    }


    public List<StageDTO> getStagesByStatus(String status, String year) {
        int yearNumber = year != null ? Integer.parseInt(year) : LocalDate.now().getYear();

        return stageRepository.findByStatus(OfferStatus.valueOf(status))
                .stream()
                .map(stage -> {
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                    return StageDTO.fromModel(stage, employeur);
                }).filter(stage -> stage.getCreatedAt().getYear() ==  yearNumber)
                .toList();
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

    public List<GestionnaireCvDTO> getAllCvs(String year) throws Exception {
        int yearNumber = year != null ? Integer.parseInt(year) : LocalDate.now().getYear();

        try {
            return cvRepository.findAll()
                    .stream()
                    .filter(cv -> {
                        LocalDate cvDate = LocalDate.ofInstant(cv.getLastModifiedDate(), ZoneId.systemDefault());
                        return cvDate.getYear() == yearNumber;
                    })
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
            CV savedCd = cvRepository.save(cv);
            createStudentNotificationForReviewedCV(savedCd);
        } catch (Exception e) {
            throw new FailedToChangeCvStatusException();
        }
    }

    public List<StageDTO> getAllStages(String year) throws FailedToRetrieveStagesException {
        int yearNumber = year != null ? Integer.parseInt(year) : LocalDate.now().getYear();

        try {
            return stageRepository.findAll().stream().map(stage -> {
                Employeur emp = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                return StageDTO.fromModel(stage, emp);
            }).filter(stage -> stage.getStartDate().getYear() ==  yearNumber).toList();
        } catch (Exception e) {
            throw new FailedToRetrieveStagesException("Échec lors de la récupération des stages.", e);
        }
    }

    @Transactional
    public List<EtudiantCandidaturesDTO> getAllEtudiantsCandidatures(String year) {
        int yearNumber = year != null && !year.isEmpty() ? Integer.parseInt(year) : LocalDate.now().getYear();
        List<Etudiant> etudiants =  etudiantRepository.findAll();

        List <EtudiantCandidaturesDTO> etudiantCandidaturesDTO = new ArrayList<>();

        etudiants.forEach(etudiant -> {
            List<Candidature> candidatures = candidatureRepository.findByEtudiant_Credentials_Username(etudiant.getEmail());

            List<EtudiantCandidatureDTO> etudiantCandidature = candidatures.stream().map(candidature -> {
                Stage stage = stageRepository.findById(candidature.getStageId()).get();
                Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                return EtudiantCandidatureDTO.builder()
                        .id(candidature.getId())
                        .stage(StageSimpleDTO.toDTOfromStageDTO(StageDTO.fromModel(stage, employeur)))
                        .status(candidature.getStatus().toString())
                        .decision(candidature.getDecision())
                        .dateDecision(candidature.getDateDecision())
                        .datePostulation(candidature.getDateCandidature())
                        .build();
            }).filter(candidature -> {
                StageSimpleDTO stage = candidature.getStage();
                LocalDate startDate = stage.getStartDate();
                return startDate.getYear() ==  yearNumber;
            }).toList();

            if(etudiantCandidature.isEmpty()){
                return;
            }

            etudiantCandidaturesDTO.add(
                    EtudiantCandidaturesDTO.builder()
                            .etudiant(EtudiantDTO.toDTOTokenless(etudiant))
                            .candidatures(etudiantCandidature)
                            .build()
            );
        });

        return etudiantCandidaturesDTO;
    }

    public NotificationsResponseDTO getGestionnaireNotifications() throws Exception {
        try {
                List<Notification> stages = notificationRepository
                        .findNotificationsByTypeAndFirstRecipientReadAtIsNull(STAGE_NOTIFICATION);
                List<Notification> postulations = notificationRepository
                        .findNotificationsByTypeAndSecondRecipientReadAtIsNull(POSTULATION_NOTIFICATION);
                List<Notification> cvs = notificationRepository
                        .findNotificationsByTypeAndFirstRecipientReadAtIsNull(NEW_CV_NOTIFICATION);
                List<Notification> convocations = notificationRepository
                        .findNotificationsByTypeAndSecondRecipientReadAtIsNull(CONVOCATION_NOTIFICATION);
                List<Notification> candidatureDecisions = notificationRepository
                        .findNotificationsByTypeAndSecondRecipientReadAtIsNull(CANDIDATURE_DECISION_NOTIFICATION);
                List<Notification> etudiantOffresResponses = notificationRepository
                        .findNotificationsByTypeAndSecondRecipientReadAtIsNull(ETUDIANT_OFFRE_DECISION_NOTIFICATION);
                List<SignatureEntenteNotification> signatureEntentes = signatureEntenteNotificationRepository
                        .findByThirdRecipientReadAtIsNullAndFirstRecipientReadAtIsNotNullAndSecondRecipientReadAtIsNotNull();

                NotificationGroupDTO stagesGroup = NotificationGroupDTO
                        .toDTO(STAGE_NOTIFICATION.getDisplayName(), stages);
                NotificationGroupDTO postulationGroup = NotificationGroupDTO
                        .toDTO(POSTULATION_NOTIFICATION.getDisplayName(), postulations);
                NotificationGroupDTO cvsGroup = NotificationGroupDTO
                        .toDTO(NEW_CV_NOTIFICATION.getDisplayName(), cvs);
                NotificationGroupDTO convocationsGroup = NotificationGroupDTO
                        .toDTO(CONVOCATION_NOTIFICATION.getDisplayName(), convocations);
                NotificationGroupDTO candidatureDecisionsGroup = NotificationGroupDTO
                        .toDTO(CANDIDATURE_DECISION_NOTIFICATION.getDisplayName(), candidatureDecisions);
                NotificationGroupDTO etudiantOffresResponsesGroup = NotificationGroupDTO
                        .toDTO(ETUDIANT_OFFRE_DECISION_NOTIFICATION.getDisplayName(), etudiantOffresResponses);
                NotificationGroupDTO signatureEntentesGroup = NotificationGroupDTO
                        .toDTO(SIGNATURE_ENTENTE_NOTIFICATION.getDisplayName(), signatureEntentes);

            return NotificationsResponseDTO
                    .toDTO(List.of(stagesGroup,
                            postulationGroup,
                            cvsGroup,
                            convocationsGroup,
                            candidatureDecisionsGroup,
                            etudiantOffresResponsesGroup,
                            signatureEntentesGroup));
        } catch (Exception e) {
            throw new NotificationExceptions.NotificationFetchException();
        }
    }

    public void markNotificationAsRead(Long notificationId) throws Exception {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(NotificationExceptions.NotificationFetchException::new);

        switch(notification.getType()) {
            case POSTULATION_NOTIFICATION,
                 CONVOCATION_NOTIFICATION,
                 CANDIDATURE_DECISION_NOTIFICATION,
                 ETUDIANT_OFFRE_DECISION_NOTIFICATION -> markPostulationAsReadBySecondRecipient(notificationId);
            case SIGNATURE_ENTENTE_NOTIFICATION -> {
                if (notification instanceof SignatureEntenteNotification signatureNotification) {
                    signatureNotification.setThirdRecipientReadAt(LocalDateTime.now());
                    signatureEntenteNotificationRepository.save(signatureNotification);
                }
            }
            default-> notificationsHelper.markNotificationAsReadByFirstRecipient(notificationId);
        }
    }

    @Transactional
    public void createStudentNotificationForReviewedCV(CV cv) {
        NouveauCvNotification notification = new NouveauCvNotification();
        if (cv.getStatus() == CvStatus.PENDING) {
            return;
        }
        String statusMessageFR = switch (cv.getStatus()) {
            case APPROVED -> "approuvé";
            case REJECTED -> "rejeté";
            default -> "";
        };
        String statusMessageEN = switch (cv.getStatus()) {
            case APPROVED -> "approved";
            case REJECTED -> "rejected";
            default -> "";
        };
        notification.setFirstRecipientReadAt(LocalDateTime.now());
        notification.setCreatedAt(OffsetDateTime.now().toLocalDateTime());
        notification.setType(CV_DECISION_NOTIFICATION);
        notification.setTargetEmail(cv.getEtudiant().getEmail());
        notification.setMessageFR("Votre CV a été " + statusMessageFR);
        notification.setMessageEN("Your CV has been " + statusMessageEN);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markPostulationAsReadBySecondRecipient(Long notificationId) throws Exception {
        try {
            Notification notification = notificationRepository.findById(notificationId)
                    .orElseThrow(NotificationExceptions.NotificationFetchException::new);
            notification.setSecondRecipientReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } catch (Exception e) {
            throw new NotificationExceptions.NotificationFetchException();
        }
    }

    @Transactional
    public void associateProfesseurToEtudiant(@RequestBody ProfesseurAssociationDTO association) throws EtudiantAlreadyAssociatedException {
        Etudiant etudiant = etudiantRepository.findEtudiantByCredentials_Username(association.getEtudiantEmail()).orElseThrow(UserNotFoundException::new);
        Professeur professeur = professeurRepository.findByCredentials_Username(association.getProfesseurEmail()).orElseThrow(UserNotFoundException::new);

        if (etudiant.getProfesseurResponsable() != null) {
            throw new EtudiantAlreadyAssociatedException("L'étudiant est déja associé a un professeur");
        }

        etudiant.setProfesseurResponsable(professeur);

        etudiantRepository.save(etudiant);
    }
}
