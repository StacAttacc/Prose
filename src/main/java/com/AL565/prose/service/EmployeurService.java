package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.notifications.*;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.exceptions.CandidatureNotFoundException;
import com.AL565.prose.service.dto.notifications.NotificationGroupDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.InvalidCandidatureModificationException;
import com.AL565.prose.service.exceptions.StageNotFoundException;
import com.AL565.prose.utils.NotificationsHelper;
import com.AL565.prose.utils.SessionYearHelper;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;

import static com.AL565.prose.model.notifications.NotificationType.*;

@Service
@AllArgsConstructor
public class EmployeurService {
    private ProseUserRepository proseUserRepository;
    private EmployeurRepository employeurRepository;
    private PasswordEncoder passwordEncoder;
    private StageRepository stageRepository;
    private NotificationRepository notificationRepository;
    private SignatureEntenteNotificationRepository signatureEntenteNotificationRepository;
    private CandidatureRepository candidatureRepository;
    private NotificationsHelper notificationsHelper;

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
        createNotificationForNewStage(saved, employeur);

        return StageDTO.toDTO(saved, employeur);
    }

    private void createNotificationForNewStage(Stage stage, Employeur employeur) {
        if (stage == null) {
            throw new IllegalArgumentException("stage must not be null");
        }
        String employeurName = employeur.getFirstName() + " " + employeur.getLastName();
        CreationStageNotification notification = new CreationStageNotification();
        notification.setCreatedAt(LocalDateTime.now());
        notification.setStageId(stage.getId());
        notification.setType(CREATION_STAGE_NOTIFICATION);
        notification.setMessageFR(employeurName + " a créé le stage " + stage.getTitle());
        notification.setMessageEN(employeurName + " has created the internship " + stage.getTitle());
        notificationRepository.save(notification);
    }

    @Transactional
    public List<StageDTO> listStagesFor(String email, String year) {
        int yearNumber = SessionYearHelper.getSessionYear(year);

        return stageRepository.findByEmployeurEmail(email)
                .stream().map((stage) -> {
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                    return StageDTO.toDTO(stage, employeur);
                }).filter(stage -> stage.getStartDate().getYear() == yearNumber).toList();
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
        Stage updatedStage = stageRepository.save(stage);
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(updatedStage.getEmployeurEmail());
        return StageDTO.toDTO(updatedStage, employeur);
    }

    @Transactional
    public List<CandidatureDTO> getStageCandidatures(long stageId) throws StageNotFoundException {
        if (stageRepository.findById(stageId).isEmpty()) {
            throw new StageNotFoundException("Le stage n'existe pas");
        }
        List<Candidature> candidatures = candidatureRepository.findAllByStage_Id(stageId).orElse(new ArrayList<>());

        return candidatures.stream().map((CandidatureDTO::toDTO)).toList();
    }

    public void updateCandidatureStatus(long candidatureId, String status) throws CandidatureNotFoundException, InvalidCandidatureModificationException {
        CandidatureStatus candidatureStatus = CandidatureStatus.getByDescription(status);
        Candidature candidature = candidatureRepository.findById(candidatureId).orElseThrow(() -> new CandidatureNotFoundException("La candidature n'existe pas"));

        if (candidatureStatus == CandidatureStatus.ACCEPTEE && candidature.getStatus() != CandidatureStatus.CONVOQUEE) {
            throw new InvalidCandidatureModificationException("Il est impossible d'accepter un étudiant avant de le convoquer en entrevue.");
        }

        candidature.setStatus(candidatureStatus);
        Candidature savedCanidature = candidatureRepository.save(candidature);
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(savedCanidature.getStage().getEmployeurEmail());
        createNotificationForCandidatureDecision(savedCanidature, employeur);
    }

    private void createNotificationForCandidatureDecision(Candidature candidature, Employeur employeur) {
        if (candidature == null || employeur == null) {
            throw new IllegalArgumentException("candidature must not be null");
        }

        String statusFR = "";
        if (candidature.getStatus() == CandidatureStatus.ACCEPTEE) {
            statusFR = "acceptée";
        } else if (candidature.getStatus() == CandidatureStatus.REFUSEE) {
            statusFR = "rejectée";
        }

        String statusEN = "";
        if (candidature.getStatus() == CandidatureStatus.ACCEPTEE) {
            statusEN = "accepted";
        } else if (candidature.getStatus() == CandidatureStatus.REFUSEE) {
            statusEN = "rejected";
        }

        String etudiantName = candidature.getEtudiant().getFirstName()
                + " " + candidature.getEtudiant().getLastName();

        String notifMessageFR = employeur.getCompany()
                + " a " + statusFR + " " + etudiantName
                + " pour le stage " + candidature.getStage().getTitle();

        String notifMessageEN = employeur.getCompany()
                + " has " + statusEN + " "
                + etudiantName + " for the internship " + candidature.getStage().getTitle();

        CandidatureDecisionNotification notification = new CandidatureDecisionNotification();
        notification.setCreatedAt(LocalDateTime.now());
        notification.setType(CANDIDATURE_DECISION_NOTIFICATION);
        notification.setMessageFR(notifMessageFR);
        notification.setMessageEN(notifMessageEN);
        notification.setCandidatureId(candidature.getId());
        notification.setTargetEmail(candidature.getEtudiant().getEmail());
        notification.setEtudiantId(candidature.getEtudiant().getId());
        notificationRepository.save(notification);
    }

    @Transactional
    public NotificationsResponseDTO getEmployeurNotifications(String employeurEmail) throws Exception {
        try {
            List<Notification> postulations = notificationRepository
                    .findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                            POSTULATION_NOTIFICATION,
                            employeurEmail
                );
            List<SignatureEntenteNotification> signatureEntentes = signatureEntenteNotificationRepository
                    .findSignatureEntenteNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmployeurEmail(
                            SIGNATURE_ENTENTE_NOTIFICATION,
                            employeurEmail
                    );
            List<Notification> etudiantOffreDecisions = notificationRepository
                    .findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                            ETUDIANT_OFFRE_DECISION_NOTIFICATION,
                            employeurEmail
                    );
            List<Notification> demandeApprobationStages = notificationRepository
                    .findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                            DEMANDE_APPROBATION_STAGE_NOTIFICATION,
                            employeurEmail
                    );

            NotificationGroupDTO etudiantOffreDecisionsGroup = NotificationGroupDTO.toDTO(
                    ETUDIANT_OFFRE_DECISION_NOTIFICATION.getDisplayName(),
                    etudiantOffreDecisions
            );
            NotificationGroupDTO signatureEntentesGroup = NotificationGroupDTO.toDTO(
                    SIGNATURE_ENTENTE_NOTIFICATION.getDisplayName(),
                    signatureEntentes
            );
            NotificationGroupDTO postulationsGroup = NotificationGroupDTO.toDTO(
                    POSTULATION_NOTIFICATION.getDisplayName(),
                    postulations
            );
            NotificationGroupDTO demandeApprobationStagesGroup = NotificationGroupDTO.toDTO(
                    DEMANDE_APPROBATION_STAGE_NOTIFICATION.getDisplayName(),
                    demandeApprobationStages
            );

            return NotificationsResponseDTO.toDTO(List.of(
                    postulationsGroup,
                    signatureEntentesGroup,
                    etudiantOffreDecisionsGroup,
                    demandeApprobationStagesGroup
            ));
        } catch (Exception e) {
            throw new NotificationExceptions.NotificationFetchException();
        }
    }

    public void markNotificationAsRead(Long notificationId) throws Exception {
        notificationsHelper.markNotificationAsReadByFirstRecipient(notificationId);
    }

    @Transactional
    public void convoquerEntrevue(long candidatureId, InterviewDTO interviewDTO) throws CandidatureNotFoundException {
        Candidature candidature = candidatureRepository.findById(candidatureId).orElseThrow(() -> new CandidatureNotFoundException("La candidature n'existe pas"));

        LocalDateTime dateDecision = interviewDTO.getDateTimeAsLocalDateTime();

        candidature.setStatus(CandidatureStatus.CONVOQUEE);
        candidature.setDateDecision(dateDecision);
        Candidature saved = candidatureRepository.save(candidature);
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(saved.getStage().getEmployeurEmail());
        createNotificationForConvocation(saved, employeur);
    }

    private void createNotificationForConvocation(Candidature candidature, Employeur employeur) {
        if (candidature == null) {
            throw new IllegalArgumentException("candidature must not be null");
        }
        String notifMessageFR = employeur.getCompany()
                + " a convoqué " + candidature.getEtudiant().getFirstName()
                + " " + candidature.getEtudiant().getLastName()
                + " pour une entrevue";

        String notifMessageEN = employeur.getCompany()
                + " has summoned " + candidature.getEtudiant().getFirstName()
                + " " + candidature.getEtudiant().getLastName()
                + " for an interview";

        ConvocationNotification notification = new ConvocationNotification();
        notification.setCreatedAt(LocalDateTime.now());
        notification.setCandidatureId(candidature.getId());
        notification.setType(NotificationType.CONVOCATION_NOTIFICATION);
        notification.setMessageFR(notifMessageFR);
        notification.setMessageEN(notifMessageEN);
        notification.setTargetEmail(candidature.getEtudiant().getEmail());
        notification.setEtudiantId(candidature.getEtudiant().getId());
        notificationRepository.save(notification);
    }
}
