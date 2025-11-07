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
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

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
    private final EntenteRepository ententeRepository;
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
        int yearNumber =  year != null ? Integer.parseInt(year) : LocalDate.now().getYear();
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
                List<Notification> convocations = notificationRepository
                        .findNotificationsByTypeAndSecondRecipientReadAt(NotificationType.CONVOCATION_NOTIFICATION, null);

                NotificationGroupDTO stagesGroup = NotificationGroupDTO
                        .toDTO(NotificationType.STAGE_NOTIFICATION.getDisplayName(), stages);
                NotificationGroupDTO postulationGroup = NotificationGroupDTO
                        .toDTO(NotificationType.POSTULATION_NOTIFICATION.getDisplayName(), postulations);
                NotificationGroupDTO cvsGroup = NotificationGroupDTO
                        .toDTO(NotificationType.GESTIONNAIRE_CV_NOTIFICATION.getDisplayName(), cvs);
                NotificationGroupDTO convocationsGroup = NotificationGroupDTO
                        .toDTO(NotificationType.CONVOCATION_NOTIFICATION.getDisplayName(), convocations);

            return NotificationsResponseDTO
                    .toDTO(List.of(stagesGroup, postulationGroup, cvsGroup, convocationsGroup));
        } catch (Exception e) {
            throw new NotificationExceptions.NotificationFetchException();
        }
    }

    public void markNotificationAsRead(Long notificationId) throws Exception {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(NotificationExceptions.NotificationFetchException::new);
        if (notification.getType() == NotificationType.POSTULATION_NOTIFICATION) {
            markPostulationAsReadBySecondRecipient(notificationId);
        } else if (notification.getType() == NotificationType.CONVOCATION_NOTIFICATION) {
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
            Notification notification = notificationRepository.findById(notificationId)
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

        // Vérifier si une entente existe déjà, si oui la retourner
        Optional<Entente> existingEntente = ententeRepository.findByCandidatureId(candidatureId);
        if (existingEntente.isPresent()) {
            Entente entente = existingEntente.get();
            Stage stage = candidature.getStage();
            Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
            return EntenteDTO.toDTO(entente, employeur);
        }

        // Sinon, créer une nouvelle entente
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
            Document document = new Document(pdfDoc, PageSize.A4)) {

            // Récupérer un gestionnaire (utiliser le premier disponible)
            Optional<Gestionnaire> gestionnaireOpt = gestionnaireRepository.findAll().stream().findFirst();
            String nomGestionnaire = gestionnaireOpt
                    .map(g -> g.getFirstName() + " " + g.getLastName())
                    .orElse("[nom_gestionnaire]");

            // Calculer le nombre de semaines
            long nombreSemaines = 0;
            if (stage.getStartDate() != null && stage.getEndDate() != null) {
                nombreSemaines = ChronoUnit.WEEKS.between(stage.getStartDate(), stage.getEndDate());
            }

            // Extraire les données
            String nomEtudiant = etudiant.getFirstName() + " " + etudiant.getLastName();
            String nomEmployeur = employeur.getFirstName() + " " + employeur.getLastName();
            String nomEntreprise = employeur.getCompany() != null ? employeur.getCompany() : "[nom_entreprise]";
            String adresseStage = stage.getLocation() != null ? stage.getLocation() : "[offre_lieuStage]";
            String dateDebut = stage.getStartDate() != null ? stage.getStartDate().toString() : "xx";
            String dateFin = stage.getEndDate() != null ? stage.getEndDate().toString() : "xx";
            String tauxHoraire = stage.getCompensation() != null ? stage.getCompensation() : "[offre_tauxHoraire]";
            String descriptionStage = stage.getDescription() != null ? stage.getDescription() : "[offre_description]";
            String horaireTravail = stage.getWorkMode() != null ? stage.getWorkMode() : "xx";

            // PAGE 1 : Page de couverture avec bordure noire
            document.setMargins(72, 72, 72, 72); // Marges de 1 pouce
            
            // Bordure noire autour de la page avec "CONTRAT DE STAGE" à l'intérieur
            Table borderTable = new Table(UnitValue.createPercentArray(1)).useAllAvailableWidth();
            borderTable.setBorder(new SolidBorder(ColorConstants.BLACK, 2));
            Cell borderCell = new Cell().setHeight(PageSize.A4.getHeight() - 150) // Hauteur totale moins marges
                    .setPadding(0)
                    .setBorder(Border.NO_BORDER)
                    .setVerticalAlignment(VerticalAlignment.MIDDLE)
                    .add(new Paragraph("CONTRAT DE STAGE")
                            .setFontSize(24)
                            .setBold()
                            .setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph(nomEntreprise)
                            .setFontSize(12)
                            .setTextAlignment(TextAlignment.CENTER)
                            .setFixedPosition(72, 100, PageSize.A4.getWidth() - 144));
            borderTable.addCell(borderCell);
            document.add(borderTable);

            // PAGE 2 : Entente de stage avec tableau
            document.add(new AreaBreak());
            document.setMargins(72, 72, 72, 72);

            // Titre "ENTENTE DE STAGE..."
            Paragraph ententeTitle = new Paragraph("ENTENTE DE STAGE INTERVENUE ENTRE LES PARTIES SUIVANTES")
                    .setFontSize(14)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(ententeTitle);

            // Introduction (centré)
            Paragraph intro = new Paragraph("Dans le cadre de la formule ATE, les parties citées ci-dessous :")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(15);
            document.add(intro);

            // Liste des parties (toutes centrées)
            Paragraph gestionnaireLine = new Paragraph("Le gestionnaire de stage, " + nomGestionnaire)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5);
            document.add(gestionnaireLine);

            Paragraph et = new Paragraph("et")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5);
            document.add(et);

            Paragraph employeurLine = new Paragraph("L'employeur, " + nomEmployeur)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5);
            document.add(employeurLine);

            Paragraph et2 = new Paragraph("et")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5);
            document.add(et2);

            Paragraph etudiantLine = new Paragraph("L'étudiant(e), " + nomEtudiant + ",")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(15);
            document.add(etudiantLine);

            Paragraph conviennent = new Paragraph("Conviennent des conditions de stage suivantes :")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(conviennent);

            // Tableau des conditions
            Table conditionsTable = new Table(UnitValue.createPercentArray(1)).useAllAvailableWidth();
            conditionsTable.setMarginBottom(20);

            // Section ENDROIT DU STAGE
            Cell cellEndroit = new Cell()
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                    .setPadding(8)
                    .add(new Paragraph("ENDROIT DU STAGE").setBold().setFontSize(12));
            conditionsTable.addCell(cellEndroit);
            
            Cell cellAdresse = new Cell()
                    .setPadding(8)
                    .add(new Paragraph("Adresse : " + adresseStage));
            conditionsTable.addCell(cellAdresse);

            // Section DUREE DU STAGE
            Cell cellDuree = new Cell()
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                    .setPadding(8)
                    .add(new Paragraph("DUREE DU STAGE").setBold().setFontSize(12));
            conditionsTable.addCell(cellDuree);
            
            Cell cellDates = new Cell()
                    .setPadding(8);
            cellDates.add(new Paragraph("Date de début : " + dateDebut));
            cellDates.add(new Paragraph("Date de fin : " + dateFin));
            cellDates.add(new Paragraph("Nombre total de semaines : " + nombreSemaines));
            conditionsTable.addCell(cellDates);

            // Section HORAIRE DE TRAVAIL
            Cell cellHoraire = new Cell()
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                    .setPadding(8)
                    .add(new Paragraph("HORAIRE DE TRAVAIL").setBold().setFontSize(12));
            conditionsTable.addCell(cellHoraire);
            
            Cell cellHoraireDetails = new Cell()
                    .setPadding(8);
            cellHoraireDetails.add(new Paragraph("Horaire de travail: " + horaireTravail));
            conditionsTable.addCell(cellHoraireDetails);

            // Section SALAIRE
            Cell cellSalaire = new Cell()
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                    .setPadding(8)
                    .add(new Paragraph("SALAIRE").setBold().setFontSize(12));
            conditionsTable.addCell(cellSalaire);
            
            Cell cellSalaireDetails = new Cell()
                    .setPadding(8)
                    .add(new Paragraph("Salaire horaire : " + tauxHoraire));
            conditionsTable.addCell(cellSalaireDetails);

            document.add(conditionsTable);

            // PAGE 3 : Tâches, responsabilités et signatures
            document.add(new AreaBreak());
            document.setMargins(72, 72, 72, 72);

            // Section TACHES ET RESPONSABILITES DU STAGIAIRE
            Paragraph tachesTitle = new Paragraph("TACHES ET RESPONSABILITES DU STAGIAIRE")
                    .setFontSize(14)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(15);
            document.add(tachesTitle);

            // Zone de description
            Table descTable = new Table(UnitValue.createPercentArray(1)).useAllAvailableWidth();
            Cell descCell = new Cell()
                    .setPadding(10)
                    .setHeight(100)
                    .add(new Paragraph(descriptionStage));
            descTable.addCell(descCell);
            document.add(descTable);

            // Section RESPONSABILITES
            Paragraph responsabilitesTitle = new Paragraph("RESPONSABILITES")
                    .setFontSize(14)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(30)
                    .setMarginBottom(15);
            document.add(responsabilitesTitle);

            Paragraph college = new Paragraph("Le Collège s'engage à :")
                    .setBold()
                    .setMarginBottom(10);
            document.add(college);
            document.add(new Paragraph("• Encadrer le déroulement du stage et s'assurer qu'il respecte les objectifs pédagogiques du programme."));
            document.add(new Paragraph("• Offrir un soutien à l'étudiant(e) et à l'entreprise en cas de difficultés ou de questions."));
            document.add(new Paragraph("• Effectuer au moins une visite ou un suivi pendant le stage afin d'évaluer la progression de l'étudiant(e)."));
            document.add(new Paragraph("• Fournir les documents nécessaires à l'évaluation et au bon déroulement du stage."));

            Paragraph entreprise = new Paragraph("L'entreprise s'engage à :")
                    .setBold()
                    .setMarginTop(15)
                    .setMarginBottom(10);
            document.add(entreprise);
            document.add(new Paragraph("• Accueillir le stagiaire dans un environnement de travail sécuritaire et formateur."));
            document.add(new Paragraph("• Confier à l'étudiant(e) des tâches correspondant à son champ d'études et au plan de stage."));
            document.add(new Paragraph("• Fournir l'encadrement, les outils et les ressources nécessaires à la réalisation des mandats."));
            document.add(new Paragraph("• Évaluer la performance du stagiaire à la fin du stage selon les critères transmis par le Collège."));
            document.add(new Paragraph("• Informer le Collège de toute situation problématique ou de tout changement important durant le stage."));

            Paragraph etudiantEngagement = new Paragraph("L'étudiant(e) s'engage à :")
                    .setBold()
                    .setMarginTop(15)
                    .setMarginBottom(10);
            document.add(etudiantEngagement);
            document.add(new Paragraph("• Respecter les règlements de l'entreprise et du Collège, ainsi que les horaires établis."));
            document.add(new Paragraph("• Faire preuve de professionnalisme, d'assiduité et de discrétion."));
            document.add(new Paragraph("• Réaliser les tâches confiées avec rigueur et sérieux."));
            document.add(new Paragraph("• Communiquer rapidement toute difficulté à son superviseur ou au gestionnaire de stage."));
            document.add(new Paragraph("• Remettre les rapports et documents exigés dans les délais prescrits."));

            // Section SIGNATURES
            Table signatureTable = new Table(UnitValue.createPercentArray(1)).useAllAvailableWidth();
            Cell signatureHeader = new Cell()
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                    .setPadding(8)
                    .add(new Paragraph("SIGNATURES").setBold().setFontSize(12));
            signatureTable.addCell(signatureHeader);

            Paragraph engagement = new Paragraph("Les parties s'engagent à respecter cette entente de stage")
                    .setBold()
                    .setMarginTop(15)
                    .setMarginBottom(10);
            document.add(engagement);

            Paragraph foi = new Paragraph("En foi de quoi les parties ont signé,")
                    .setBold()
                    .setMarginBottom(20);
            document.add(foi);

            // Signature Étudiant
            Paragraph etudiantSig = new Paragraph("L'étudiant(e):")
                    .setBold()
                    .setMarginBottom(10);
            document.add(etudiantSig);

            Table etudiantSigTable = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
            Cell etudiantSigCell = new Cell()
                    .setPadding(5)
                    .add(new Paragraph("signature: "));
            Cell etudiantDateCell = new Cell()
                    .setPadding(5)
                    .add(new Paragraph("Date: "));
            etudiantSigTable.addCell(etudiantSigCell);
            etudiantSigTable.addCell(etudiantDateCell);
            document.add(etudiantSigTable);

            // Signature Employeur
            Paragraph employeurSig = new Paragraph("L'employeur :")
                    .setBold()
                    .setMarginTop(20)
                    .setMarginBottom(10);
            document.add(employeurSig);

            Table employeurSigTable = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
            Cell employeurSigCell = new Cell()
                    .setPadding(5)
                    .add(new Paragraph("signature: "));
            Cell employeurDateCell = new Cell()
                    .setPadding(5)
                    .add(new Paragraph("Date: "));
            employeurSigTable.addCell(employeurSigCell);
            employeurSigTable.addCell(employeurDateCell);
            document.add(employeurSigTable);

            // Signature Gestionnaire
            Paragraph gestionnaireSig = new Paragraph("Le gestionnaire de stage :")
                    .setBold()
                    .setMarginTop(20)
                    .setMarginBottom(10);
            document.add(gestionnaireSig);

            Table gestionnaireSigTable = new Table(UnitValue.createPercentArray(2)).useAllAvailableWidth();
            Cell gestionnaireSigCell = new Cell()
                    .setPadding(5)
                    .add(new Paragraph("signature: "));
            Cell gestionnaireDateCell = new Cell()
                    .setPadding(5)
                    .add(new Paragraph("Date: "));
            gestionnaireSigTable.addCell(gestionnaireSigCell);
            gestionnaireSigTable.addCell(gestionnaireDateCell);
            document.add(gestionnaireSigTable);

            document.close();
            return baos.toByteArray();
        }
    }
}
