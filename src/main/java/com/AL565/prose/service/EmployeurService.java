package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
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
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
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
    private EntenteRepository ententeRepository;
    private EvaluationRepository evaluationRepository;
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
    public StageDTO createStage(StageDTO dto, String callerEmail) {
        if (dto == null) {
            throw new IllegalArgumentException("stage must not be null");
        }
        if (callerEmail == null) {
            throw new AccessDeniedException("Accès refusé");
        }

        Stage model = StageDTO.toModel(dto);
        model.setEmployeurEmail(callerEmail);
        Stage saved = stageRepository.save(model);
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
    public List<StageDTO> listStagesFor(String email, String year, String callerEmail) {
        assertCallerEqualsEmail(callerEmail, email);
        int yearNumber = SessionYearHelper.getSessionYear(year);

        return stageRepository
                .findByEmployeurEmailAndStartDateBetween(email, java.time.LocalDate.of(yearNumber, 1, 1), java.time.LocalDate.of(yearNumber, 12, 31))
                .stream()
                .map((stage) -> {
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                    return StageDTO.toDTO(stage, employeur);
                })
                .toList();
    }

    @Transactional
    public List<CandidatureDTO> getStageCandidatures(long stageId, String callerEmail) throws StageNotFoundException {
        Stage stage = stageRepository.findById(stageId)
                .orElseThrow(() -> new StageNotFoundException("Le stage n'existe pas"));
        assertCallerEqualsEmail(callerEmail, stage.getEmployeurEmail());
        List<Candidature> candidatures = candidatureRepository.findAllByStage_Id(stageId).orElse(new ArrayList<>());

        return candidatures.stream().map((CandidatureDTO::toDTO)).toList();
    }

    public void updateCandidatureStatus(long candidatureId, String status, String callerEmail) throws CandidatureNotFoundException, InvalidCandidatureModificationException {
        CandidatureStatus candidatureStatus = CandidatureStatus.getByDescription(status);
        Candidature candidature = candidatureRepository.findById(candidatureId).orElseThrow(() -> new CandidatureNotFoundException("La candidature n'existe pas"));
        assertCallerEqualsEmail(callerEmail, candidature.getStage().getEmployeurEmail());

        if (candidatureStatus == CandidatureStatus.ACCEPTEE && candidature.getStatus() != CandidatureStatus.CONVOQUEE) {
            throw new InvalidCandidatureModificationException("Il est impossible d'accepter un étudiant avant de le convoquer en entrevue.");
        }

        candidature.setStatus(candidatureStatus);
        Candidature savedCanidature = candidatureRepository.save(candidature);
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(savedCanidature.getStage().getEmployeurEmail());
        createNotificationForCandidatureDecision(savedCanidature, employeur);
    }

    private void assertCallerEqualsEmail(String callerEmail, String resourceEmail) {
        if (callerEmail == null || resourceEmail == null || !callerEmail.equals(resourceEmail)) {
            throw new AccessDeniedException("Accès refusé");
        }
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
    public void convoquerEntrevue(long candidatureId, InterviewDTO interviewDTO, String callerEmail) throws CandidatureNotFoundException {
        Candidature candidature = candidatureRepository.findById(candidatureId).orElseThrow(() -> new CandidatureNotFoundException("La candidature n'existe pas"));
        assertCallerEqualsEmail(callerEmail, candidature.getStage().getEmployeurEmail());

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

    @Transactional
    public EvaluationDTO createEvaluation(Long employeurId, EvaluationDTO evaluationDTO, String callerEmail) {
        Employeur employeur = employeurRepository.findById(employeurId)
                .orElseThrow(() -> new EntityNotFoundException("Employeur non trouvé avec l'ID: " + employeurId));
        assertCallerEqualsEmail(callerEmail, employeur.getEmail());

        Entente entente = ententeRepository.findById(evaluationDTO.getEntenteId())
                .orElseThrow(() -> new EntityNotFoundException("Entente non trouvée avec l'ID: " + evaluationDTO.getEntenteId()));

        String stageEmployeurEmail = entente.getCandidature().getStage().getEmployeurEmail();
        if (stageEmployeurEmail == null || !stageEmployeurEmail.equals(callerEmail)) {
            throw new AccessDeniedException("Cette entente ne vous appartient pas");
        }

        if (entente.getStatus() != EntenteStatus.SIGNEE) {
            throw new IllegalStateException("L'entente doit être signée pour pouvoir évaluer le stagiaire");
        }

        if (evaluationRepository.existsByEntenteId(entente.getId())) {
            throw new IllegalStateException("Une évaluation existe déjà pour ce stage");
        }

        String password = evaluationDTO.getPassword();
        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe est requis pour créer et signer l'évaluation");
        }

        if (!passwordEncoder.matches(password, employeur.getPassword())) {
            throw new IllegalArgumentException("Mot de passe incorrect");
        }

        Etudiant etudiant = entente.getEtudiant();

        return EvaluationDTO.toDTO(evaluationRepository.save(EvaluationDTO.toModel(evaluationDTO, etudiant,  employeur, entente)));
    }

    @Transactional
    public EvaluationDTO getEvaluationByEntente(Long employeurId, Long ententeId, String callerEmail) {
        Employeur employeur = employeurRepository.findById(employeurId)
                .orElseThrow(() -> new EntityNotFoundException("Employeur non trouvé avec l'ID: " + employeurId));
        assertCallerEqualsEmail(callerEmail, employeur.getEmail());

        Evaluation evaluation = evaluationRepository.findByEntenteId(ententeId)
                .orElseThrow(() -> new EntityNotFoundException("Aucune évaluation trouvée pour cette entente"));

        if (!evaluation.getEmployeur().getId().equals(employeurId)) {
            throw new IllegalStateException("Vous n'êtes pas autorisé à consulter cette évaluation");
        }

        return EvaluationDTO.toDTO(evaluation);
    }

    @Transactional
    public List<EntenteDTO> getEntentesNeedingEvaluation(Long employeurId, String year, String callerEmail) {
        Employeur employeur = employeurRepository.findById(employeurId)
                .orElseThrow(() -> new EntityNotFoundException("Employeur non trouvé avec l'ID: " + employeurId));
        assertCallerEqualsEmail(callerEmail, employeur.getEmail());

        int yearNumber = SessionYearHelper.getSessionYear(year);

        List<Entente> ententes = ententeRepository
                .findAllByStatusAndCandidature_Stage_EmployeurEmail(EntenteStatus.SIGNEE, employeur.getCredentials().getUsername())
                .stream()
                .filter(e -> e.getCandidature().getStage().getStartDate() != null &&
                        e.getCandidature().getStage().getStartDate().getYear() == yearNumber)
                .toList();

        return ententes.stream()
                .map(entente -> EntenteDTO.toDTO(entente, employeur))
                .toList();
    }
}
