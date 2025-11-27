package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.EntenteRepository;
import com.AL565.prose.repository.ProseUserRepository;
import com.AL565.prose.security.JwtTokenProvider;
import com.AL565.prose.security.exceptions.UserNotFoundException;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.utils.PDFUtils;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
@AllArgsConstructor
public class UtilisateurService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final ProseUserRepository userRepository;
    private final EntenteRepository ententeRepository;
    private final EmployeurRepository employeurRepository;

    private final PDFUtils pdfUtils;

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

    public String getPDFEntente(String id) throws Exception {
        Entente entente = ententeRepository.findById(Long.parseLong(id)).orElseThrow(IllegalArgumentException::new);

        Candidature candidature = entente.getCandidature();
        Etudiant etudiant = candidature.getEtudiant();
        Stage stage = candidature.getStage();
        Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());

        byte[] pdf = pdfUtils.generateContractPdfWithSignatures(
                etudiant,
                employeur,
                stage,
                entente.getDateSignatureEtudiant(),
                entente.getDateSignatureEmployeur(),
                entente.getDateSignatureGestionnaire()
        );

        return Base64.getEncoder().encodeToString(pdf);
    }
}
