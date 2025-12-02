package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.model.notifications.NotificationType;
import com.AL565.prose.model.notifications.SignatureEntenteNotification;
import com.AL565.prose.repository.*;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.security.exceptions.AuthenticationException;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.utils.PDFHelper;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UtilisateurService {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    private final JwtTokenProvider jwtTokenProvider;
    private final ProseUserRepository userRepository;
    private final EntenteRepository ententeRepository;
    private final EmployeurRepository employeurRepository;
    private final GestionnaireRepository  gestionnaireRepository;
    private final CandidatureRepository candidatureRepository;
    private final NotificationRepository notificationRepository;
    private final SignatureEntenteNotificationRepository signatureEntenteNotificationRepository;

    private final PDFHelper pdfHelper;

    public ProseUserDTO login(LoginRequestDTO request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtTokenProvider.generateToken(authentication);

        ProseUser user = userRepository.findByCredentials_Username(request.getEmail())
                .orElseThrow(UserNotFoundException::new);

        return switch (user.getRole()) {
            case EMPLOYEUR -> EmployeurDTO.toDTO((Employeur) user, token);
            case ETUDIANT -> EtudiantDTO.toDTO((Etudiant) user, token);
            case GESTIONNAIRE -> GestionnaireDTO.toDTO((Gestionnaire) user, token);
            case PROFESSEUR -> ProfesseurDTO.toDTO((Professeur) user, token);
        };
    }

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

    public String getPDFEntente(String id) throws Exception {
        Entente entente = ententeRepository.findById(Long.parseLong(id)).orElseThrow(IllegalArgumentException::new);

        Candidature candidature = entente.getCandidature();
        Etudiant etudiant = candidature.getEtudiant();
        Stage stage = candidature.getStage();
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());

        byte[] pdf = pdfHelper.generateContractPdfWithSignatures(
                etudiant,
                employeur,
                stage,
                entente.getDateSignatureEtudiant(),
                entente.getDateSignatureEmployeur(),
                entente.getDateSignatureGestionnaire()
        );

        return Base64.getEncoder().encodeToString(pdf);
    }

    @Transactional
    public void signEntente(SignEntenteRequestDTO request, Long ententeId, String userEmail) throws Exception {
        ProseUser user = userRepository.findByCredentials_Username(userEmail).orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException(HttpStatus.UNAUTHORIZED, "Le passsord est incorrect");
        }

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

    @Transactional
    protected void createNotificationForGestionnaireWhenBothSigned(Entente entente) {
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
}
