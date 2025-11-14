package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.SignatureEntenteNotification;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.EntenteDTO;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class EntenteService {
    
    private final EntenteRepository ententeRepository;
    private final CandidatureRepository candidatureRepository;
    private final EmployeurRepository employeurRepository;
    private final GestionnaireRepository gestionnaireRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public EntenteDTO getEntenteByCandidatureId(Long candidatureId) throws Exception {
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new IllegalArgumentException("Candidature non trouvée"));

        Optional<Entente> existingEntente = ententeRepository.findByCandidatureId(candidatureId);
        if (existingEntente.isPresent()) {
            Entente entente = existingEntente.get();
            Stage stage = candidature.getStage();
            Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
            return EntenteDTO.toDTO(entente, employeur);
        }

        throw new IllegalArgumentException("Aucune entente trouvée pour cette candidature");
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
            Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
            return EntenteDTO.toDTO(entente, employeur);
        }

        Etudiant etudiant = candidature.getEtudiant();
        Stage stage = candidature.getStage();
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());

        byte[] pdfData = generateContractPdfWithSignatures(candidature, etudiant, employeur, stage, null, null, null);

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

        createNotificationWhenEntenteIsGenerated(entente);

        return EntenteDTO.toDTO(entente, employeur);
    }

    @Transactional
    public void createNotificationWhenEntenteIsGenerated(Entente entente) {
        String messageFR = "Une entente doit être sigée pour le stage "
                + entente.getCandidature().getStage().getTitle();
        String messageEN = "An agreement needs to be signed for the "
                + entente.getCandidature().getStage().getTitle() + " internship";
        SignatureEntenteNotification notification = new SignatureEntenteNotification();
        notification.setCreatedAt(LocalDateTime.now());
        notification.setMessageFR(messageFR);
        notification.setMessageEN(messageEN);
        notification.setType(NotificationType.SIGNATURE_ENTENTE_NOTIFICATION);
        notification.setSignatureEntenteCandidatureId(entente.getCandidature().getId());
        notification
                .setSignatureEntenteEmployeurEmail(entente.getCandidature().getStage().getEmployeurEmail());
        notification.setSignatureEntenteEtudiantEmail(entente.getCandidature().getEtudiant().getEmail());
        notification.setSignatureEntenteStageId(entente.getCandidature().getStageId());

        notificationRepository.save(notification);
    }

    @Transactional
    public void signEntente(Long ententeId, String userEmail) throws Exception {
        Entente entente = ententeRepository.findById(ententeId)
                .orElseThrow(() -> new IllegalArgumentException("Entente non trouvée"));
        
        Candidature candidature = entente.getCandidature();
        Etudiant etudiant = candidature.getEtudiant();
        Stage stage = candidature.getStage();
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
        
        LocalDateTime now = LocalDateTime.now();
        
        if (etudiant.getEmail().equals(userEmail)) {
            entente.setDateSignatureEtudiant(now);
            if (entente.getDateSignatureEmployeur() != null) {
                // Les deux (étudiant et employeur) ont signé, mais pas encore le gestionnaire
                entente.setStatus(EntenteStatus.SIGNEE_ETUDIANT_ET_EMPLOYEUR);
            } else {
                entente.setStatus(EntenteStatus.SIGNEE_ETUDIANT);
            }
        } else if (employeur.getEmail().equals(userEmail)) {
            entente.setDateSignatureEmployeur(now);
            if (entente.getDateSignatureEtudiant() != null) {
                // Les deux (étudiant et employeur) ont signé, mais pas encore le gestionnaire
                entente.setStatus(EntenteStatus.SIGNEE_ETUDIANT_ET_EMPLOYEUR);
            } else {
                entente.setStatus(EntenteStatus.SIGNEE_EMPLOYEUR);
            }
        } else {
            Optional<Gestionnaire> gestionnaireOpt = gestionnaireRepository.findByCredentials_Username(userEmail);
            if (gestionnaireOpt.isEmpty()) {
                throw new IllegalArgumentException("Utilisateur non autorisé à signer cette entente");
            }
            if (entente.getDateSignatureEtudiant() == null || entente.getDateSignatureEmployeur() == null) {
                throw new IllegalArgumentException("Le gestionnaire ne peut signer que lorsque l'étudiant et l'employeur ont déjà signé l'entente");
            }
            // Le gestionnaire signe en dernier
            entente.setDateSignatureGestionnaire(now);
            entente.setStatus(EntenteStatus.SIGNEE);
            entente.setDateSignatureComplete(now);
        }
        
        byte[] pdfData = generateContractPdfWithSignatures(
            candidature, 
            etudiant, 
            employeur, 
            stage,
            entente.getDateSignatureEtudiant(),
            entente.getDateSignatureEmployeur(),
            entente.getDateSignatureGestionnaire()
        );
        
        entente.setDocumentPdf(pdfData);
        entente.setDocumentSize((long) pdfData.length);
        ententeRepository.save(entente);
    }

    private byte[] generateContractPdfWithSignatures(Candidature candidature, Etudiant etudiant, 
                                        Employeur employeur, Stage stage,
                                        LocalDateTime dateSignatureEtudiant,
                                        LocalDateTime dateSignatureEmployeur,
                                        LocalDateTime dateSignatureGestionnaire) throws Exception {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4)) {

            Optional<Gestionnaire> gestionnaireOpt = gestionnaireRepository.findAll().stream().findFirst();
            String nomGestionnaire = gestionnaireOpt
                    .map(g -> g.getFirstName() + " " + g.getLastName())
                    .orElse("[nom_gestionnaire]");

            long nombreSemaines = 0;
            if (stage.getStartDate() != null && stage.getEndDate() != null) {
                nombreSemaines = ChronoUnit.WEEKS.between(stage.getStartDate(), stage.getEndDate());
            }

            String nomEtudiant = etudiant.getFirstName() + " " + etudiant.getLastName();
            String nomEmployeur = employeur.getFirstName() + " " + employeur.getLastName();
            String nomEntreprise = employeur.getCompany() != null ? employeur.getCompany() : "[nom_entreprise]";
            String adresseStage = stage.getLocation() != null ? stage.getLocation() : "[offre_lieuStage]";
            String dateDebut = stage.getStartDate() != null ? stage.getStartDate().toString() : "xx";
            String dateFin = stage.getEndDate() != null ? stage.getEndDate().toString() : "xx";
            String tauxHoraire = stage.getCompensation() != null ? stage.getCompensation() : "[offre_tauxHoraire]";
            String descriptionStage = stage.getDescription() != null ? stage.getDescription() : "[offre_description]";
            String horaireTravail = stage.getWorkMode() != null ? stage.getWorkMode() : "xx";

            document.setMargins(72, 72, 72, 72);
            
            Table borderTable = new Table(UnitValue.createPercentArray(1)).useAllAvailableWidth();
            borderTable.setBorder(new SolidBorder(ColorConstants.BLACK, 2));
            Cell borderCell = new Cell().setHeight(PageSize.A4.getHeight() - 150)
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

            document.add(new AreaBreak());
            document.setMargins(72, 72, 72, 72);

            Paragraph ententeTitle = new Paragraph("ENTENTE DE STAGE INTERVENUE ENTRE LES PARTIES SUIVANTES")
                    .setFontSize(14)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(ententeTitle);

            Paragraph intro = new Paragraph("Dans le cadre de la formule ATE, les parties citées ci-dessous :")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(15);
            document.add(intro);

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

            Table conditionsTable = new Table(UnitValue.createPercentArray(1)).useAllAvailableWidth();
            conditionsTable.setMarginBottom(20);

            Cell cellEndroit = new Cell()
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                    .setPadding(8)
                    .add(new Paragraph("ENDROIT DU STAGE").setBold().setFontSize(12));
            conditionsTable.addCell(cellEndroit);
            
            Cell cellAdresse = new Cell()
                    .setPadding(8)
                    .add(new Paragraph("Adresse : " + adresseStage));
            conditionsTable.addCell(cellAdresse);

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

            Cell cellHoraire = new Cell()
                    .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                    .setPadding(8)
                    .add(new Paragraph("HORAIRE DE TRAVAIL").setBold().setFontSize(12));
            conditionsTable.addCell(cellHoraire);
            
            Cell cellHoraireDetails = new Cell()
                    .setPadding(8);
            cellHoraireDetails.add(new Paragraph("Horaire de travail: " + horaireTravail));
            conditionsTable.addCell(cellHoraireDetails);

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

            document.add(new AreaBreak());
            document.setMargins(72, 72, 72, 72);

            Paragraph tachesTitle = new Paragraph("TACHES ET RESPONSABILITES DU STAGIAIRE")
                    .setFontSize(14)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(15);
            document.add(tachesTitle);

            Table descTable = new Table(UnitValue.createPercentArray(1)).useAllAvailableWidth();
            Cell descCell = new Cell()
                    .setPadding(10)
                    .setHeight(100)
                    .add(new Paragraph(descriptionStage));
            descTable.addCell(descCell);
            document.add(descTable);

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

            Paragraph etudiantSig = new Paragraph("L'étudiant(e):")
                    .setBold()
                    .setMarginBottom(10);
            document.add(etudiantSig);

            String etudiantSignatureText;
            if (dateSignatureEtudiant != null) {
                String dateEtudiant = dateSignatureEtudiant.toLocalDate().toString();
                etudiantSignatureText = "signé par " + nomEtudiant + " le " + dateEtudiant;
            } else {
                etudiantSignatureText = "signé par ... le ...";
            }
            Paragraph etudiantSignature = new Paragraph(etudiantSignatureText)
                    .setMarginBottom(10);
            document.add(etudiantSignature);

            Paragraph employeurSig = new Paragraph("L'employeur :")
                    .setBold()
                    .setMarginTop(20)
                    .setMarginBottom(10);
            document.add(employeurSig);

            String employeurSignatureText;
            if (dateSignatureEmployeur != null) {
                String dateEmployeur = dateSignatureEmployeur.toLocalDate().toString();
                employeurSignatureText = "signé par " + nomEmployeur + " le " + dateEmployeur;
            } else {
                employeurSignatureText = "signé par ... le ...";
            }
            Paragraph employeurSignature = new Paragraph(employeurSignatureText)
                    .setMarginBottom(10);
            document.add(employeurSignature);

            Paragraph gestionnaireSig = new Paragraph("Le gestionnaire de stage :")
                    .setBold()
                    .setMarginTop(20)
                    .setMarginBottom(10);
            document.add(gestionnaireSig);

            String gestionnaireSignatureText;
            if (dateSignatureGestionnaire != null) {
                String dateGestionnaire = dateSignatureGestionnaire.toLocalDate().toString();
                gestionnaireSignatureText = "signé par " + nomGestionnaire + " le " + dateGestionnaire;
            } else {
                gestionnaireSignatureText = "signé par ... le ...";
            }
            Paragraph gestionnaireSignature = new Paragraph(gestionnaireSignatureText)
                    .setMarginBottom(10);
            document.add(gestionnaireSignature);

            document.close();
            return baos.toByteArray();
        }
    }
}
