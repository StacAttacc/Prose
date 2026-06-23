package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.model.notifications.*;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.exceptions.CvExceptions.*;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.dto.notifications.NotificationGroupDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.dto.MillieuEvaluationDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.EtudiantAlreadyAssociatedException;
import com.AL565.prose.service.exceptions.FailedToRetrieveStagesException;

import com.AL565.prose.utils.NotificationsHelper;
import com.AL565.prose.utils.SessionYearHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static com.AL565.prose.model.notifications.NotificationType.*;

@Service
@Slf4j
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
    private final NotificationsHelper notificationsHelper;
    private final EntenteRepository ententeRepository;

    private final ProfesseurService professeurService;

    public void saveGestionnaire(GestionnairePasswordDTO dto) {
        if (gestionnaireRepository.findByCredentials_Username(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }

        dto.setPassword(passwordEncoder.encode(dto.getPassword()));

        gestionnaireRepository.save(GestionnairePasswordDTO.toModel(dto));
    }


    public List<StageDTO> getStagesByStatus(String status, String year) {
        int yearNumber = SessionYearHelper.getSessionYear(year);

        return stageRepository
                .findByStatusAndStartDateBetween(OfferStatus.valueOf(status), LocalDate.of(yearNumber, 1, 1), LocalDate.of(yearNumber, 12, 31))
                .stream()
                .map(stage -> {
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                    return StageDTO.toDTO(stage, employeur);
                })
                .toList();
    }

    @Transactional
    public StageDTO approuverStage(Long stageId) {
        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new NoSuchElementException("Stage non trouvé"));

        stage.setStatus(OfferStatus.APPROUVEE);
        Stage updatedStage = stageRepository.save(stage);

        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(updatedStage.getEmployeurEmail());

        createNotificationForApprovedOrRejectedStage(updatedStage);

        return StageDTO.toDTO(updatedStage, employeur);
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

        createNotificationForApprovedOrRejectedStage(updatedStage);

        return StageDTO.toDTO(updatedStage, employeur);
    }

    public List<GestionnaireCvDTO> getAllCvs(String year) throws Exception {
        int yearNumber = SessionYearHelper.getSessionYear(year);
        Instant rangeStart = LocalDate.of(yearNumber - 1, 9, 1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant rangeEnd = LocalDate.of(yearNumber, 9, 1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        try {
            return cvRepository.findAllByLastModifiedDateGreaterThanEqualAndLastModifiedDateLessThan(rangeStart, rangeEnd)
                    .stream()
                    .map(GestionnaireCvDTO::toMetadataDto)
                    .toList();
        } catch (Exception e) {
            throw new FailedToFetchCvsException();
        }
    }

    public String getCvDataById(Long cvId) {
        CV cv = cvRepository.findById(cvId).orElseThrow(CvNotFoundException::new);
        return java.util.Base64.getEncoder().encodeToString(cv.getData());
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
        int yearNumber = SessionYearHelper.getSessionYear(year);

        try {
            return stageRepository
                    .findAllByStartDateBetween(LocalDate.of(yearNumber, 1, 1), LocalDate.of(yearNumber, 12, 31))
                    .stream()
                    .map(stage -> {
                        Employeur emp = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                        return StageDTO.toDTO(stage, emp);
                    })
                    .toList();
        } catch (Exception e) {
            throw new FailedToRetrieveStagesException("Échec lors de la récupération des stages.", e);
        }
    }

    @Transactional
    public Page<EtudiantCandidaturesDTO> getAllEtudiantsCandidatures(String year, Pageable pageable) {
        int yearNumber = SessionYearHelper.getSessionYear(year);
        Page<Etudiant> etudiantPage = etudiantRepository.findAll(pageable);
        List<Etudiant> etudiants = etudiantPage.getContent();

        List <EtudiantCandidaturesDTO> etudiantCandidaturesDTO = new ArrayList<>();

        etudiants.forEach(etudiant -> {
            List<Candidature> candidatures = candidatureRepository.findByEtudiant_Credentials_Username(etudiant.getEmail());

            List<EtudiantCandidatureDTO> etudiantCandidature = candidatures.stream().map(candidature -> {
                Stage stage = stageRepository.findById(candidature.getStageId()).get();
                Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                return EtudiantCandidatureDTO.builder()
                        .id(candidature.getId())
                        .stage(StageDTO.toDTO(stage, employeur))
                        .status(candidature.getStatus().toString())
                        .decision(candidature.getDecision())
                        .dateDecision(candidature.getDateDecision())
                        .datePostulation(candidature.getDateCandidature())
                        .evaluationMillieu(candidature.getEvaluationMillieu() != null ?
                                MillieuEvaluationDTO.toDTO(candidature.getEvaluationMillieu()) : null)
                        .build();
            }).filter(candidature -> {
                StageDTO stage = candidature.getStage();
                LocalDate startDate = stage.getStartDate();
                return startDate.getYear() ==  yearNumber;
            }).toList();

            if ((candidatures.isEmpty() && SessionYearHelper.isInSessionRange(yearNumber)) || !etudiantCandidature.isEmpty()) {
                etudiantCandidaturesDTO.add(
                        EtudiantCandidaturesDTO.builder()
                                .etudiant(EtudiantDTO.toDTOTokenless(etudiant))
                                .candidatures(
                                        etudiantCandidature.isEmpty() ?
                                                null : etudiantCandidature)
                                .build()
                );
            }
        });

        return new org.springframework.data.domain.PageImpl<>(etudiantCandidaturesDTO, pageable, etudiantPage.getTotalElements());
    }

    public NotificationsResponseDTO getGestionnaireNotifications() throws Exception {
        try {
                List<Notification> stages = notificationRepository
                        .findNotificationsByTypeAndFirstRecipientReadAtIsNull(CREATION_STAGE_NOTIFICATION);
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
                List<Notification> gestionnaireEntentes = notificationRepository
                        .findNotificationsByTypeAndFirstRecipientReadAtIsNull(GESTIONNAIRE_ENTENTE_NOTIFICATION);

                NotificationGroupDTO stagesGroup = NotificationGroupDTO
                        .toDTO(CREATION_STAGE_NOTIFICATION.getDisplayName(), stages);
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
                NotificationGroupDTO gestionnaireEntentesGroup = NotificationGroupDTO
                        .toDTO(GESTIONNAIRE_ENTENTE_NOTIFICATION.getDisplayName(), gestionnaireEntentes);

            return NotificationsResponseDTO
                    .toDTO(List.of(stagesGroup,
                            postulationGroup,
                            cvsGroup,
                            convocationsGroup,
                            candidatureDecisionsGroup,
                            etudiantOffresResponsesGroup,
                            gestionnaireEntentesGroup));
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des notifications", e);
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
            default-> notificationsHelper.markNotificationAsReadByFirstRecipient(notificationId);
        }
    }

    @Transactional
    public void createStudentNotificationForReviewedCV(CV cv) {
        NouveauCvNotification notification = new NouveauCvNotification();
        if (cv.getStatus() == CvStatus.PENDING) {
            return;
        }
        notification.setCreatedAt(LocalDateTime.now());
        notification.setType(CV_DECISION_NOTIFICATION);
        notification.setTargetEmail(cv.getEtudiant().getEmail());
        notification.setMessageFR("Votre CV a été " + translateStatusMessage(cv.getStatus(), "FR"));
        notification.setMessageEN("Your CV has been " + translateStatusMessage(cv.getStatus(), "EN"));
        notification.setCvId(cv.getId());
        notificationRepository.save(notification);
    }

    @Transactional
    protected void createNotificationForApprovedOrRejectedStage(Stage stage) {
        if (stage.getStatus() == OfferStatus.SOUMISE) {
            return;
        }

        String messageFR = "Votre offre de stage '" + stage.getTitle()
                + "' a été " + translateStatusMessage(stage.getStatus(), "FR");
        String messageEN = "Your internship offer '" + stage.getTitle()
                + "' has been " + translateStatusMessage(stage.getStatus(), "EN");

        DemandeApprobationStageNotification notification = new DemandeApprobationStageNotification();
        notification.setCreatedAt(LocalDateTime.now());
        notification.setType(DEMANDE_APPROBATION_STAGE_NOTIFICATION);
        notification.setTargetEmail(stage.getEmployeurEmail());
        notification.setStageId(stage.getId());
        notification.setMessageFR(messageFR);
        notification.setMessageEN(messageEN);

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

    @Transactional
    public void createProfesseur(ProfesseurPasswordDTO professeurDTO) {
        // Validation des champs requis
        if (professeurDTO.getFirstName() == null || professeurDTO.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("Le prénom est requis");
        }
        if (professeurDTO.getLastName() == null || professeurDTO.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom est requis");
        }
        if (professeurDTO.getEmail() == null || professeurDTO.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("L'email est requis");
        }
        if (professeurDTO.getPassword() == null || professeurDTO.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe est requis");
        }
        if (professeurDTO.getDiscipline() == null || professeurDTO.getDiscipline().trim().isEmpty()) {
            throw new IllegalArgumentException("La discipline est requise");
        }

        // Vérifier que la discipline est valide
        try {
            Discipline.valueOf(professeurDTO.getDiscipline().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Discipline invalide");
        }

        // Créer le professeur via le service
        professeurService.register(professeurDTO);
    }

    @Transactional
    public CandidatureDTO assignStageToStudent(AssignStageDTO dto) {
        // Validation des champs requis
        if (dto.getEtudiantEmail() == null || dto.getEtudiantEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("L'email de l'étudiant est requis");
        }
        if (dto.getStageId() == null) {
            throw new IllegalArgumentException("L'ID du stage est requis");
        }

        // 1. Vérifier que l'étudiant existe
        Etudiant etudiant = etudiantRepository.findEtudiantByCredentials_Username(dto.getEtudiantEmail())
                .orElseThrow(() -> new IllegalArgumentException("Étudiant non trouvé"));

        // 2. Vérifier que l'étudiant a un CV approuvé
        CV cv = cvRepository.findByEtudiant_Credentials_Username(dto.getEtudiantEmail())
                .orElseThrow(() -> new IllegalArgumentException("L'étudiant n'a pas de CV"));

        if (cv.getStatus() != CvStatus.APPROVED) {
            throw new IllegalArgumentException("L'étudiant doit avoir un CV approuvé pour qu'un stage lui soit attribué");
        }

        // 3. Vérifier que le stage existe et est approuvé
        Stage stage = stageRepository.findById(dto.getStageId())
                .orElseThrow(() -> new NoSuchElementException("Stage non trouvé"));

        if (stage.getStatus() != OfferStatus.APPROUVEE) {
            throw new IllegalArgumentException("Le stage doit être approuvé pour être attribué à un étudiant");
        }

        // 4. Vérifier qu'il n'y a pas déjà une candidature pour cet étudiant et ce stage
        if (candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(
                dto.getEtudiantEmail(), dto.getStageId())) {
            throw new IllegalArgumentException("Une candidature existe déjà pour cet étudiant et ce stage");
        }

        // 5. Créer la candidature avec le statut CONFIRMER
        Candidature candidature = Candidature.builder()
                .etudiant(etudiant)
                .cv(cv)
                .stage(stage)
                .motivationLetter(null)
                .dateCandidature(LocalDateTime.now())
                .status(CandidatureStatus.CONFIRMER)
                .dateDecision(LocalDateTime.now())
                .decision(dto.getComment() != null && !dto.getComment().trim().isEmpty() ? dto.getComment() : null)
                .build();

        Candidature savedCandidature = candidatureRepository.save(candidature);

        // 6. Créer une notification pour l'étudiant
        createNotificationForAssignedStage(savedCandidature);

        return CandidatureDTO.toDTO(savedCandidature);
    }

    @Transactional
    protected void createNotificationForAssignedStage(Candidature candidature) {
        String stageTitle = candidature.getStage().getTitle();

        String messageFR = "Un stage vous a été attribué : " + stageTitle;
        String messageEN = "An internship has been assigned to you: " + stageTitle;

        AssignationNotification notification = new AssignationNotification();
        notification.setCreatedAt(LocalDateTime.now());
        notification.setType(ASSIGNATION_NOTIFICATION);
        notification.setMessageFR(messageFR);
        notification.setMessageEN(messageEN);
        notification.setCandidatureId(candidature.getId());
        notification.setTargetEmail(candidature.getEtudiant().getEmail());
        notification.setEtudiantId(candidature.getEtudiant().getId());
        notificationRepository.save(notification);
    }

    private String translateStatusMessage(CvStatus status, String language) {
        return switch (status) {
            case APPROVED -> language.equals("FR") ? "approuvé" : "approved";
            case REJECTED -> language.equals("FR") ? "rejeté" : "rejected";
            default -> "";
        };
    }

    public Page<EtudiantDTO> getAllEtudiants(Pageable pageable) {
        return etudiantRepository.findAll(pageable).map(EtudiantDTO::toDTOTokenless);
    }

    public Page<ProfesseurDTO> getAllProfesseurs(Pageable pageable) {
        return professeurRepository.findAll(pageable).map(ProfesseurDTO::toDTOTokenless);
    }

    private String translateStatusMessage(OfferStatus status, String language) {
        return switch (status) {
            case APPROUVEE -> language.equals("FR") ? "approuvée" : "approved";
            case REJETEE -> language.equals("FR") ? "rejetée" : "rejected";
            default -> "";
        };
    }

    @Transactional
    public EntenteDTO genererEntente(Long candidatureId) throws Exception {
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new IllegalArgumentException("Candidature non trouvée"));

        if (candidature.getStatus() != CandidatureStatus.CONFIRMER) {
            throw new IllegalArgumentException("La candidature doit être confirmée pour générer une entente");
        }

        Optional<Entente> existingEntente = ententeRepository.findByCandidatureId(candidatureId);
        if (existingEntente.isPresent()) {
            Entente entente = existingEntente.get();
            Stage stage = candidature.getStage();
            Employeur employeur = null;
            if (stage.getEmployeurEmail() != null && !stage.getEmployeurEmail().trim().isEmpty()) {
                employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
            }
            return EntenteDTO.toDTO(entente, employeur);
        }

        Stage stage = candidature.getStage();
        Employeur employeur = null;
        if (stage.getEmployeurEmail() != null && !stage.getEmployeurEmail().trim().isEmpty()) {
            employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
        }

        Entente entente = Entente.builder()
                .candidature(candidature)
                .status(EntenteStatus.A_SIGNER)
                .dateCreation(LocalDateTime.now())
                .build();

        entente = ententeRepository.save(entente);

        createNotificationWhenEntenteIsGenerated(entente);

        return EntenteDTO.toDTO(entente, employeur);
    }

    @Transactional
    public void createNotificationWhenEntenteIsGenerated(Entente entente) throws Exception {
        if (entente == null || entente.getCandidature() == null) {
            throw new NotificationExceptions.NotificationCreationException();
        }
        SignatureEntenteNotification notification = new SignatureEntenteNotification();
        String employeurEmail = entente.getCandidature().getStage().getEmployeurEmail();
        String etudiantEmail = entente.getCandidature().getEtudiant().getEmail();

        String messageFR = "Une entente doit être sigée pour le stage "
                + entente.getCandidature().getStage().getTitle();
        String messageEN = "An agreement needs to be signed for the "
                + entente.getCandidature().getStage().getTitle() + " internship";

        notification.setCreatedAt(LocalDateTime.now());
        notification.setMessageFR(messageFR);
        notification.setMessageEN(messageEN);
        notification.setType(NotificationType.SIGNATURE_ENTENTE_NOTIFICATION);
        notification.setFirstRecipientReadAt(null);
        notification.setSecondRecipientReadAt(null);

        notification.setCandidatureId(entente.getCandidature().getId());
        notification.setTargetEmployeurEmail(employeurEmail);
        notification.setTargetEtudiantEmail(etudiantEmail);
        notification.setStageId(entente.getCandidature().getStageId());

        notificationRepository.save(notification);
    }
}
