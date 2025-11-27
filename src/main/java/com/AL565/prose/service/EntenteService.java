package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.SignatureEntenteNotification;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.EntenteDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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
    private final SignatureEntenteNotificationRepository signatureEntenteNotificationRepository;

    @Transactional
    public EntenteDTO getEntenteByCandidatureId(Long candidatureId) {
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
    public EntenteDTO genererEntente(Long candidatureId) {
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
    public void createNotificationWhenEntenteIsGenerated(Entente entente) {
        Optional<SignatureEntenteNotification> existingNotification = signatureEntenteNotificationRepository
                .findByCandidatureId(entente.getCandidature().getId());
        
        if (existingNotification.isEmpty()) {
            existingNotification = signatureEntenteNotificationRepository
                    .findByStageId(entente.getCandidature().getStageId());
        }
        
        SignatureEntenteNotification notification;
        if (existingNotification.isPresent()) {
            notification = existingNotification.get();
            notification.setCreatedAt(LocalDateTime.now());
            notification.setMessageFR("Une entente doit être sigée pour le stage "
                    + entente.getCandidature().getStage().getTitle());
            notification.setMessageEN("An agreement needs to be signed for the "
                    + entente.getCandidature().getStage().getTitle() + " internship");
        } else {
            String messageFR = "Une entente doit être sigée pour le stage "
                    + entente.getCandidature().getStage().getTitle();
            String messageEN = "An agreement needs to be signed for the "
                    + entente.getCandidature().getStage().getTitle() + " internship";
            notification = new SignatureEntenteNotification();
            notification.setCreatedAt(LocalDateTime.now());
            notification.setMessageFR(messageFR);
            notification.setMessageEN(messageEN);
            notification.setType(NotificationType.SIGNATURE_ENTENTE_NOTIFICATION);
            notification.setCandidatureId(entente.getCandidature().getId());
            String employeurEmail = entente.getCandidature().getStage().getEmployeurEmail();
            notification.setTargetEmployeurEmail(employeurEmail != null ? employeurEmail : "");
            notification.setTargetEtudiantEmail(entente.getCandidature().getEtudiant().getEmail());
            notification.setStageId(entente.getCandidature().getStageId());
        }

        notificationRepository.save(notification);
    }

    @Transactional
    public void createNotificationForGestionnaireWhenBothSigned(Entente entente) {
        List<SignatureEntenteNotification> existingNotifications = signatureEntenteNotificationRepository
                .findByThirdRecipientReadAtIsNullAndFirstRecipientReadAtIsNotNullAndSecondRecipientReadAtIsNotNull()
                .stream()
                .filter(n -> n.getCandidatureId() != null
                        && n.getCandidatureId().equals(entente.getCandidature().getId()))
                .toList();
        
        if (!existingNotifications.isEmpty()) {
            return;
        }
        
        String etudiantNom = entente.getCandidature().getEtudiant().getFirstName() + " " 
                + entente.getCandidature().getEtudiant().getLastName();
        String stageTitre = entente.getCandidature().getStage().getTitle();
        
        String messageFR = "L'étudiant " + etudiantNom + " et l'employeur ont tous deux signé l'entente de stage pour " + stageTitre;
        String messageEN = "Student " + etudiantNom + " and employer have both signed the internship agreement for " + stageTitre;
        
        SignatureEntenteNotification notification = new SignatureEntenteNotification();
        notification.setCreatedAt(LocalDateTime.now());
        notification.setMessageFR(messageFR);
        notification.setMessageEN(messageEN);
        notification.setType(NotificationType.SIGNATURE_ENTENTE_NOTIFICATION);
        notification.setCandidatureId(entente.getCandidature().getId());
        notification.setTargetEmployeurEmail(entente.getCandidature().getStage().getEmployeurEmail());
        notification.setTargetEtudiantEmail(entente.getCandidature().getEtudiant().getEmail());
        notification.setFirstRecipientReadAt(LocalDateTime.now());
        notification.setSecondRecipientReadAt(LocalDateTime.now());
        notification.setStageId(entente.getCandidature().getStageId());

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
                entente.setStatus(EntenteStatus.SIGNEE_ETUDIANT_ET_EMPLOYEUR);
                createNotificationForGestionnaireWhenBothSigned(entente);
            } else {
                entente.setStatus(EntenteStatus.SIGNEE_ETUDIANT);
            }
        } else if (employeur != null && employeur.getEmail().equals(userEmail)) {
            entente.setDateSignatureEmployeur(now);
            if (entente.getDateSignatureEtudiant() != null) {
                entente.setStatus(EntenteStatus.SIGNEE_ETUDIANT_ET_EMPLOYEUR);
                createNotificationForGestionnaireWhenBothSigned(entente);
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

            entente.setDateSignatureGestionnaire(now);
            entente.setStatus(EntenteStatus.SIGNEE);
            entente.setDateSignatureComplete(now);
        }

        ententeRepository.save(entente);
    }


}
