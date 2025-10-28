package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.OfferStatus;
import com.AL565.prose.model.Stage;
import com.AL565.prose.model.notifications.EtudiantCvNotification;
import com.AL565.prose.model.notifications.GestionnaireCvNotification;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.PostulationNotification;
import com.AL565.prose.repository.*;
import com.AL565.prose.model.CV;
import com.AL565.prose.model.CvStatus;
import com.AL565.prose.model.Candidature;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import com.AL565.prose.service.dto.EtudiantPasswordDTO;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.dto.EtudiantCandidatureDTO;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.service.dto.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.AL565.prose.security.exceptions.CvExceptions;
import com.AL565.prose.service.dto.notifications.NotificationGroupDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;

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
    private final GestionnaireCvNotificationRepository gestionnaireCvNotificationRepository;
    private final EtudiantCvNotificationRepository etudiantCvNotificationRepository;
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
                    return StageDTO.fromModel(stage, employeur);
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

        gestionnaireCvNotificationRepository.findByCv_Id(cvSaved.getId())
                        .ifPresentOrElse(notification -> {
                            notification.setFirstRecipientReadAt(null);
                            notification.setCreatedAt(OffsetDateTime.now().toLocalDateTime());
                            notificationRepository.save(notification);
                        }, () -> createNotificationForNewCV(etudiant, cvSaved));
    }

    private void createNotificationForNewCV(Etudiant etudiant, CV cv) {
        if (cv == null) {
            throw new IllegalArgumentException("Vous devez avoir un cv");
        }
        String etudiantName = etudiant.getFirstName() + " " + etudiant.getLastName();
        GestionnaireCvNotification notification = new GestionnaireCvNotification();
        notification.setCv(cv);
        notification.setFirstRecipientReadAt(null);
        notification.setCreatedAt(OffsetDateTime.now().toLocalDateTime());
        notification.setType(NotificationType.GESTIONNAIRE_CV_NOTIFICATION);
        notification.setMessage(etudiantName + " a soumis un nouveau CV");
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
        notification.setCreatedAt(OffsetDateTime.now().toLocalDateTime());
        notification.setCandidature(candidature);
        notification.setType(NotificationType.POSTULATION_NOTIFICATION);
        notification.setMessage(studentName + " a postulé pour le stage " + companyName);
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
            List<EtudiantCvNotification> cvNotifications = etudiantCvNotificationRepository
                    .findEtudiantCvNotificationsByFirstRecipientReadAtAndEtudiantEmail(
                            null,
                            etudiantEmail);

            NotificationGroupDTO cvGroup = NotificationGroupDTO
                    .toDTO(NotificationType.ETUDIANT_CV_NOTIFICATION.getDisplayName(), cvNotifications);

            return NotificationsResponseDTO.toDTO(List.of(cvGroup));
        } catch (Exception e) {
            throw new NotificationExceptions.NotificationFetchException();
        }
    }

    public void markNotificationAsRead(Long notificationId) throws Exception {
        notificationsHelper.markNotificationAsReadByFirstRecipient(notificationId);
    }
}