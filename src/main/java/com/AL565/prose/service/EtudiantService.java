package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import com.AL565.prose.model.notifications.*;
import com.AL565.prose.repository.*;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.CvStatus;
import com.AL565.prose.model.Candidature;
import com.AL565.prose.model.CandidatureStatus;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.dto.EtudiantCandidatureDTO;
import com.AL565.prose.service.dto.EtudiantResponseOfferDTO;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.dto.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.AL565.prose.security.exceptions.CvExceptions;
import com.AL565.prose.service.dto.notifications.NotificationGroupDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.InvalidCandidatureModificationException;
import com.AL565.prose.service.exceptions.CandidatureNotFoundException;
import com.AL565.prose.utils.NotificationsHelper;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;

import static com.AL565.prose.model.notifications.NotificationType.*;

@Service
@Transactional
@AllArgsConstructor
public class EtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final ProseUserRepository proseUserRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final CvRepository cvRepository;
    private final PasswordEncoder passwordEncoder;
    private final StageRepository stageRepository;
    private final EmployeurRepository employeurRepository;
    private final CandidatureRepository candidatureRepository;
    private final NotificationRepository notificationRepository;
    private final SignatureEntenteNotificationRepository signatureEntenteNotificationRepository;
    private final NotificationsHelper notificationsHelper;

    public void inscrireEtudiant(EtudiantPasswordDTO dto) {
        if (proseUserRepository.findByCredentials_Username(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Un compte avec cet email existe déjà");
        }

        dto.setPassword(passwordEncoder.encode(dto.getPassword()));

        Etudiant etudiant = EtudiantPasswordDTO.toModel(dto);

        etudiantRepository.save(etudiant);
    }

    public EtudiantDTO getByEmail(String email) {
        return EtudiantDTO.toDTOTokenless(etudiantRepository.findEtudiantByCredentials_Username(email).get());
    }

    public List<StageDTO> getEtudiantStages(String token) {

        String cleanToken = token.replace("Bearer ", "");
        String etudiantEmail = jwtTokenProvider.getEmailFromJWT(cleanToken);

        List<Stage> stagesApprouves = stageRepository.findByStatus(OfferStatus.APPROUVEE);

        Set<Long> stageIdsPostules = candidatureRepository
                .findByEtudiant_Credentials_Username(etudiantEmail)
                .stream()
                .map(candidature -> candidature.getStage().getId())
                .collect(Collectors.toSet());

        return stagesApprouves.stream()
                .filter(stage -> !stageIdsPostules.contains(stage.getId()))
                .map(stage -> {
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                    return StageDTO.toDTO(stage, employeur);
                })
                .collect(Collectors.toList());
    }

    public void saveCv(MultipartFile cv, String email, String lastModified) throws Exception {
        if (cv == null || cv.isEmpty()) {
            throw new CvExceptions.NoFileException();
        }

        if (cv.getContentType() == null || !MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(cv.getContentType())) {
            throw new CvExceptions.IncorrectFileException();
        }

        byte[] data;
        try {
            data = cv.getBytes();
        } catch (IOException e) {
            throw new CvExceptions.FileReadingException();
        }

        Etudiant etudiant = etudiantRepository.findEtudiantByCredentials_Username(email)
                .orElseThrow(CvExceptions.StudentNotFoundException::new);

        CV newCv = CV.builder()
                .name(cv.getOriginalFilename())
                .type(cv.getContentType())
                .size(cv.getSize())
                .lastModified(lastModified)
                .lastModifiedDate(Instant.now())
                .data(data)
                .etudiant(etudiant)
                .status(CvStatus.PENDING)
                .comment(null)
                .build();

        CV cvSaved = cvRepository.findByEtudiant_Credentials_Username(email)
                .map(existingCv -> {
                    existingCv.setName(newCv.getName());
                    existingCv.setType(newCv.getType());
                    existingCv.setSize(newCv.getSize());
                    existingCv.setLastModified(newCv.getLastModified());
                    existingCv.setLastModifiedDate(newCv.getLastModifiedDate());
                    existingCv.setData(newCv.getData());
                    existingCv.setStatus(CvStatus.PENDING);
                    existingCv.setComment(newCv.getComment());
                    return cvRepository.save(existingCv);
                })
                .orElseGet(() -> cvRepository.save(newCv));

        createNotificationForNewCV(etudiant, cvSaved);
    }

    private void createNotificationForNewCV(Etudiant etudiant, CV cv) {
        if (cv == null) {
            throw new IllegalArgumentException("Vous devez avoir un cv");
        }
        String etudiantName = etudiant.getFirstName() + " " + etudiant.getLastName();
        NouveauCvNotification notification = new NouveauCvNotification();
        notification.setCvId(cv.getId());
        notification.setTargetEmail(etudiant.getEmail());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setType(NEW_CV_NOTIFICATION);
        notification.setMessageFR(etudiantName + " a soumis un nouveau CV");
        notification.setMessageEN(etudiantName + " has submitted a new CV");
        notificationRepository.save(notification);
    }

    public EtudiantCvDTO getCvByEmail(String username) {
        return cvRepository.findByEtudiant_Credentials_Username(username)
                .map(EtudiantCvDTO::toDto)
                .orElse(null);
    }


    public boolean hasApprovedCv(String email) {
        return cvRepository.findByEtudiant_Credentials_Username(email)
                .map(cv -> cv.getStatus() == CvStatus.APPROVED)
                .orElse(false);
    }

    public void createCandidature(CandidatureDTO candidatureDTO) throws Exception {
        if (candidatureDTO == null) {
            throw new IllegalArgumentException("Les données de candidature sont requises");
        }

        if (candidatureDTO.getStageId() == null) {
            throw new IllegalArgumentException("L'ID du stage est requis");
        }

        if (candidatureDTO.getEtudiantEmail() == null || candidatureDTO.getEtudiantEmail().isEmpty()) {
            throw new IllegalArgumentException("L'email de l'étudiant est requis");
        }

        if (candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(
                candidatureDTO.getEtudiantEmail(), candidatureDTO.getStageId())) {
            throw new Exception("Vous avez déjà postulé à ce stage");
        }

        if (candidatureDTO.getMotivationLetterData() != null && candidatureDTO.getMotivationLetterData().length > 0) {
            if (candidatureDTO.getMotivationLetterContentType() == null ||
                    !MediaType.APPLICATION_PDF_VALUE.equalsIgnoreCase(candidatureDTO.getMotivationLetterContentType())) {
                throw new Exception("La lettre de motivation doit être au format PDF");
            }
        }

        Etudiant etudiant = etudiantRepository.findEtudiantByCredentials_Username(candidatureDTO.getEtudiantEmail())
                .orElseThrow(() -> new Exception("Étudiant non trouvé"));

        CV cv = cvRepository.findByEtudiant_Credentials_Username(candidatureDTO.getEtudiantEmail())
                .orElseThrow(() -> new Exception("CV non trouvé"));

        if (cv.getStatus() != CvStatus.APPROVED) {
            throw new Exception("Le CV n'est pas approuvé");
        }

        var stage = stageRepository.findById(candidatureDTO.getStageId())
                .orElseThrow(() -> new Exception("Stage non trouvé"));

        Candidature candidature = candidatureDTO.toModel(etudiant, cv, stage);

        Candidature savedCandidature = candidatureRepository.save(candidature);
        createNotificationForNewCandidature(savedCandidature);
    }

    private void createNotificationForNewCandidature(Candidature candidature) {
        if (candidature == null) {
            throw new IllegalArgumentException("Candidature exister");
        }
        String studentName = candidature.getEtudiant().getFirstName() + " " + candidature.getEtudiant().getLastName();
        String companyName = candidature.getStage().getTitle();
        PostulationNotification notification = new PostulationNotification();
        notification.setFirstRecipientReadAt(null);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setCandidatureId(candidature.getId());
        notification.setEtudiantId(candidature.getEtudiant().getId());
        notification.setStageId(candidature.getStage().getId());
        notification.setTargetEmail(candidature.getStage().getEmployeurEmail());
        notification.setType(POSTULATION_NOTIFICATION);
        notification.setMessageFR(studentName + " a postulé pour le stage " + companyName);
        notification.setMessageEN(studentName + " has applied for the " + companyName + " internship");
        notificationRepository.save(notification);
    }

    public boolean hasAlreadyApplied(String email, Long stageId) {
        return candidatureRepository.existsByEtudiant_Credentials_UsernameAndStage_Id(email, stageId);
    }

    public List<EtudiantCandidatureDTO> getMesCandidatures(String email) {
        List<Candidature> candidatures = candidatureRepository.findByEtudiant_Credentials_Username(email);

        return candidatures.stream()
                .map(candidature -> {
                    String employeurEmail = candidature.getStage().getEmployeurEmail();
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(employeurEmail);
                    return EtudiantCandidatureDTO.toDTO(candidature, employeur);
                })
                .collect(Collectors.toList());
    }

    public NotificationsResponseDTO getStudentsNotifications(String etudiantEmail) throws Exception {
        try {
            List<Notification> cvs = notificationRepository
                    .findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                            CV_DECISION_NOTIFICATION,
                            etudiantEmail
                    );
            List<Notification> convocations = notificationRepository
                    .findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                            CONVOCATION_NOTIFICATION,
                            etudiantEmail
                    );
            List<Notification> candidatures = notificationRepository
                    .findNotificationsByTypeAndFirstRecipientReadAtIsNullAndTargetEmail(
                            CANDIDATURE_DECISION_NOTIFICATION,
                            etudiantEmail
                    );
            List<SignatureEntenteNotification> signatures = signatureEntenteNotificationRepository
                    .findSignatureEntenteNotificationsByTypeAndSecondRecipientReadAtIsNullAndTargetEtudiantEmail(
                            SIGNATURE_ENTENTE_NOTIFICATION,
                            etudiantEmail
                    );

            NotificationGroupDTO cvGroup = NotificationGroupDTO
                    .toDTO(NEW_CV_NOTIFICATION.getDisplayName(), cvs);
            NotificationGroupDTO convocationGroup = NotificationGroupDTO
                    .toDTO(CONVOCATION_NOTIFICATION.getDisplayName(), convocations);
            NotificationGroupDTO candidatureDecisionGroup = NotificationGroupDTO
                    .toDTO(CANDIDATURE_DECISION_NOTIFICATION.getDisplayName(), candidatures);
            NotificationGroupDTO signatureEntenteGroup = NotificationGroupDTO
                    .toDTO(SIGNATURE_ENTENTE_NOTIFICATION.getDisplayName(), signatures);

            return NotificationsResponseDTO.toDTO(List.of(
                    cvGroup,
                    convocationGroup,
                    candidatureDecisionGroup,
                    signatureEntenteGroup
            ));
        } catch (Exception e) {
            throw new NotificationExceptions.NotificationFetchException();
        }
    }

    public void markNotificationAsRead(Long notificationId) throws Exception {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(NotificationExceptions.NotificationFetchException::new);
        if (notification.getType() == SIGNATURE_ENTENTE_NOTIFICATION || notification.getType() == NEW_CV_NOTIFICATION) {
            notification.setSecondRecipientReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        } else {
            notificationsHelper.markNotificationAsReadByFirstRecipient(notificationId);
        }
    }

    public void respondToOffer(String email, EtudiantResponseOfferDTO responseDTO)
            throws CandidatureNotFoundException, InvalidCandidatureModificationException {

        Candidature candidature = candidatureRepository.findById(responseDTO.getCandidatureId())
                .orElseThrow(() -> new CandidatureNotFoundException("Candidature non trouvée"));

        if (!candidature.getEtudiant().getCredentials().getUsername().equals(email)) {
            throw new InvalidCandidatureModificationException("Cette candidature ne vous appartient pas");
        }
        if (candidature.getStatus() != CandidatureStatus.ACCEPTEE) {
            throw new InvalidCandidatureModificationException(
                "Vous ne pouvez répondre qu'à une candidature acceptée par l'employeur");
        }

        if (responseDTO.isAccepted()) {
            candidature.setStatus(CandidatureStatus.CONFIRMER);
        } else {
            candidature.setStatus(CandidatureStatus.REFUSEE_ETUDIANT);
        }

        if (responseDTO.getComment() != null && !responseDTO.getComment().trim().isEmpty()) {
            candidature.setDecision(responseDTO.getComment());
        }

        candidature.setDateDecision(LocalDateTime.now());

        candidatureRepository.save(candidature);

        createNotificationForEmployeurResponse(candidature, responseDTO.isAccepted());
    }

    private void createNotificationForEmployeurResponse(Candidature candidature, boolean accepted) {
        String studentName = candidature.getEtudiant().getFirstName() + " " + candidature.getEtudiant().getLastName();
        String stageTitle = candidature.getStage().getTitle();
        String decisionFR = accepted ? "accepté" : "refusé";
        String decisionEN = accepted ? "accepted" : "rejected";

        String messageFR = studentName + " a " + decisionFR + " l'offre pour le stage " + stageTitle;
        String messageEN = studentName + " has " + decisionEN + " the offer for " + stageTitle;

        EtudiantOffreDecisionNotification notification = new EtudiantOffreDecisionNotification();
        notification.setCreatedAt(LocalDateTime.now());
        notification.setCandidatureId(candidature.getId());
        notification.setEtudiantId(candidature.getEtudiant().getId());
        notification.setStageId(candidature.getStage().getId());
        notification.setTargetEmail(candidature.getStage().getEmployeurEmail());
        notification.setOffreAcceptedByStudent(accepted);
        notification.setType(ETUDIANT_OFFRE_DECISION_NOTIFICATION);
        notification.setMessageFR(messageFR);
        notification.setMessageEN(messageEN);

        notificationRepository.save(notification);
    }
}