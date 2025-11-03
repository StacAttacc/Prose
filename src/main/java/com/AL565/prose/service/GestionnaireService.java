package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.model.notifications.*;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.exceptions.CvExceptions.*;
import com.AL565.prose.security.exceptions.NotificationExceptions;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.dto.notifications.NotificationGroupDTO;
import com.AL565.prose.service.dto.notifications.NotificationsResponseDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.service.exceptions.FailedToRetrieveStagesException;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
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
    private final EtudiantRepository etudiantRepository;
    private final PasswordEncoder passwordEncoder;
    private final CandidatureRepository candidatureRepository;
    private final NotificationRepository notificationRepository;
    private final PostulationNotificationRepository postulastionNotificationRepository;
    private final EntenteRepository ententeRepository;
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
            CV savedCd = cvRepository.save(cv);
            createStudentNotificationForReviewedCV(savedCd);
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

    @Transactional
    public List<EtudiantCandidaturesDTO> getAllEtudiantsCandidatures() {
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
            }).toList();

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
                        .findNotificationsByTypeAndFirstRecipientReadAt(NotificationType.STAGE_NOTIFICATION, null);
                List<Notification> postulations = notificationRepository
                        .findNotificationsByTypeAndSecondRecipientReadAt(NotificationType.POSTULATION_NOTIFICATION, null);
                List<Notification> cvs = notificationRepository
                        .findNotificationsByTypeAndFirstRecipientReadAt(NotificationType.GESTIONNAIRE_CV_NOTIFICATION, null);

                NotificationGroupDTO stagesGroup = NotificationGroupDTO
                        .toDTO(NotificationType.STAGE_NOTIFICATION.getDisplayName(), stages);
                NotificationGroupDTO postulationGroup = NotificationGroupDTO
                        .toDTO(NotificationType.POSTULATION_NOTIFICATION.getDisplayName(), postulations);
                NotificationGroupDTO cvsGroup = NotificationGroupDTO
                        .toDTO(NotificationType.GESTIONNAIRE_CV_NOTIFICATION.getDisplayName(), cvs);

            return NotificationsResponseDTO.toDTO(List.of(stagesGroup, postulationGroup, cvsGroup));
        } catch (Exception e) {
            throw new NotificationExceptions.NotificationFetchException();
        }
    }

    public void markNotificationAsRead(Long notificationId) throws Exception {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(NotificationExceptions.NotificationFetchException::new);
        if (notification.getType() == NotificationType.POSTULATION_NOTIFICATION) {
            markPostulationAsReadBySecondRecipient(notificationId);
        } else {
            notificationsHelper.markNotificationAsReadByFirstRecipient(notificationId);
        }
    }

    @Transactional
    public void createStudentNotificationForReviewedCV(CV cv) {
        EtudiantCvNotification notification = new EtudiantCvNotification();
        if (cv.getStatus() == CvStatus.PENDING) {
            return;
        }
        String statusMessage = switch (cv.getStatus()) {
            case APPROVED -> "approuvé";
            case REJECTED -> "rejeté";
            default -> "";
        };
        notification.setFirstRecipientReadAt(null);
        notification.setCreatedAt(OffsetDateTime.now().toLocalDateTime());
        notification.setType(NotificationType.ETUDIANT_CV_NOTIFICATION);
        notification.setEtudiantEmail(cv.getEtudiant().getEmail());
        notification.setMessage("Votre CV a été " + statusMessage + ".");
        notificationRepository.save(notification);
    }

    @Transactional
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
    @Transactional
    public EntenteDTO genererEntente(Long candidatureId) throws Exception {
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new IllegalArgumentException("Candidature non trouvée"));

        if (candidature.getStatus() != CandidatureStatus.CONFIRMER) {
            throw new IllegalArgumentException("La candidature doit être confirmée pour générer une entente");
        }

        if (ententeRepository.existsByCandidatureId(candidatureId)) {
            throw new IllegalArgumentException("Une entente existe déjà pour cette candidature");
        }

        Etudiant etudiant = candidature.getEtudiant();
        Stage stage = candidature.getStage();
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());

        byte[] pdfData = generateContractPdf(candidature, etudiant, employeur, stage);

        Entente entente = Entente.builder()
                .candidature(candidature)
                .status(EntenteStatus.A_SIGNER)
                .documentPdf(pdfData)
                .documentName("entente_stage_" + candidatureId + ".pdf")
                .documentType("application/pdf")
                .documentSize((long) pdfData.length)
                .dateCreation(LocalDateTime.now())
                .build();

        entente = ententeRepository.save(entente);

        return EntenteDTO.toDTO(entente, employeur);
    }

    private byte[] generateContractPdf(Candidature candidature, Etudiant etudiant, 
                                        Employeur employeur, Stage stage) throws Exception {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc)) {

            document.add(new Paragraph("ENTENTE DE STAGE")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));
            
            document.add(new Paragraph("\n"));
            
            document.add(new Paragraph("ÉTUDIANT:")
                    .setBold());
            document.add(new Paragraph(etudiant.getFirstName() + " " + etudiant.getLastName()));
            document.add(new Paragraph("Email: " + etudiant.getEmail()));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("EMPLOYEUR:")
                    .setBold());
            document.add(new Paragraph(employeur.getFirstName() + " " + employeur.getLastName()));
            document.add(new Paragraph("Entreprise: " + employeur.getCompany()));
            document.add(new Paragraph("Email: " + employeur.getEmail()));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("STAGE:")
                    .setBold());
            document.add(new Paragraph("Titre: " + stage.getTitle()));
            document.add(new Paragraph("Description: " + stage.getDescription()));
            document.add(new Paragraph("Lieu: " + stage.getLocation()));
            document.add(new Paragraph("Compensation: " + stage.getCompensation()));
            document.add(new Paragraph("Date début: " + stage.getStartDate()));
            document.add(new Paragraph("Date fin: " + stage.getEndDate()));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("SIGNATURES:")
                    .setBold());
            document.add(new Paragraph("\n\n\n"));
            document.add(new Paragraph("Étudiant: _________________  Date: __________"));
            document.add(new Paragraph("\n\n"));
            document.add(new Paragraph("Employeur: _________________  Date: __________"));

            document.close();
            return baos.toByteArray();
        }
    }
}
