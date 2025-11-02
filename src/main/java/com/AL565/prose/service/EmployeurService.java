package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.notifications.ConvocationNotification;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.PostulationNotification;
import com.AL565.prose.model.notifications.StageNotification;
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
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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
    private NotificationsHelper notificationsHelper;
    private PostulationNotificationRepository postulationNotificationRepository;

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

        return StageDTO.fromModel(saved, employeur);
    }

    private void createNotificationForNewStage(Stage stage, Employeur employeur) {
        if (stage == null) {
            throw new IllegalArgumentException("stage must not be null");
        }
        String employeurName = employeur.getFirstName() + " " + employeur.getLastName();
        StageNotification notification = new StageNotification();
        notification.setFirstRecipientReadAt(null);
        notification.setCreatedAt(OffsetDateTime.now().toLocalDateTime());
        notification.setStage(stage);
        notification.setType(NotificationType.STAGE_NOTIFICATION);
        notification.setMessage(employeurName + " a créé le stage " +stage.getTitle());
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

    public void updateCandidatureStatus(long candidatureId, String status) throws CandidatureNotFoundException, InvalidCandidatureModificationException {
        CandidatureStatus candidatureStatus = CandidatureStatus.getByDescription(status);
        Candidature candidature = candidatureRepository.findById(candidatureId).orElseThrow(() -> new CandidatureNotFoundException("La candidature n'existe pas"));

        if (candidatureStatus == CandidatureStatus.ACCEPTEE && candidature.getStatus() != CandidatureStatus.CONVOQUEE) {
            throw new InvalidCandidatureModificationException("Il est impossible d'accepter un étudiant avant de le convoquer en entrevue.");
        }

        candidature.setStatus(candidatureStatus);
        candidatureRepository.save(candidature);
    }

    @Transactional
    public NotificationsResponseDTO getPostulationNotifications(String employeurEmail) throws Exception {
        try {
            List<PostulationNotification> notifications =
                    postulationNotificationRepository
                            .findByFirstRecipientReadAtAndEmployeurEmail(null, employeurEmail);
            NotificationGroupDTO group = NotificationGroupDTO.toDTO("postulation", notifications);
            return NotificationsResponseDTO.toDTO(List.of(group));
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
        createNotificationForNewEnterview(saved, employeur);
    }

    private void createNotificationForNewEnterview(Candidature candidature, Employeur employeur) {
        if (candidature == null) {
            throw new IllegalArgumentException("candidature must not be null");
        }
        String notifMessage = employeur.getCompany()
                + " a convoqué " + candidature.getEtudiant().getFirstName()
                + " " + candidature.getEtudiant().getLastName()
                + " pour une entrevue";
        ConvocationNotification notification = new ConvocationNotification();
        notification.setFirstRecipientReadAt(null);
        notification.setSecondRecipientReadAt(null);
        notification.setCreatedAt(OffsetDateTime.now().toLocalDateTime());
        notification.setCandidatureConvocationId(candidature.getId());
        notification.setType(NotificationType.CONVOCATION_NOTIFICATION);
        notification.setMessage(notifMessage);
        notification.setEtudiantConvocationEmail(candidature.getEtudiant().getEmail());
        notification.setEtudiantConvocationId(candidature.getEtudiant().getId());
        notificationRepository.save(notification);
    }
}
