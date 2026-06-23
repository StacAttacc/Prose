package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.utils.SessionYearHelper;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@AllArgsConstructor
public class ProfesseurService {
    private ProfesseurRepository professeurRepository;

    private PasswordEncoder passwordEncoder;

    private MillieuEvaluationRepository millieuEvaluationRepository;
    private CandidatureRepository candidatureRepository;
    private EtudiantRepository etudiantRepository;
    private EmployeurRepository employeurRepository;
    private StageRepository stageRepository;
    private EntenteRepository ententeRepository;

    public void register(ProfesseurPasswordDTO professeur) {
        if (professeurRepository.findByCredentials_Username(professeur.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Le professeur existe déja");
        }

        professeur.setPassword(passwordEncoder.encode(professeur.getPassword()));
        professeurRepository.save(ProfesseurPasswordDTO.toModel(professeur));
    }

    @Transactional
    public void evaluateWorkplace(MillieuEvaluationDTO evaluation, long candidatureId, String callerEmail) {
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new NoSuchElementException("Candidature non trouvée"));

        Professeur caller = professeurRepository.findByCredentials_Username(callerEmail)
                .orElseThrow(() -> new AccessDeniedException("Accès refusé"));
        Professeur responsable = candidature.getEtudiant().getProfesseurResponsable();
        if (responsable == null || !responsable.getId().equals(caller.getId())) {
            throw new AccessDeniedException("Vous n'êtes pas le professeur responsable de cet étudiant");
        }

        evaluation.setId(null);

        if (evaluation.getHrSemaineMois() == null) {
            evaluation.setHrSemaineMois(new ArrayList<>());
        }
        if (evaluation.getDebutQuarts() == null) {
            evaluation.setDebutQuarts(new ArrayList<>());
        }
        if (evaluation.getFinQuarts() == null) {
            evaluation.setFinQuarts(new ArrayList<>());
        }

        MillieuEvaluation millieuEvaluation = MillieuEvaluationDTO.toModel(evaluation);
        millieuEvaluation = millieuEvaluationRepository.save(millieuEvaluation);

        candidature.setEvaluationMillieu(millieuEvaluation);
        candidature = candidatureRepository.save(candidature);

        millieuEvaluation.setCandidature(candidature);
        millieuEvaluationRepository.save(millieuEvaluation);

    }

    @Transactional
    public List<CandidatureEvaluationDTO> getAllCandidaturesProfesseurRelated(String year, String professeurId, String callerEmail) {
        assertCallerIsProfesseur(callerEmail, professeurId);
        int yearNumber = SessionYearHelper.getSessionYear(year);

        return candidatureRepository.findAllByEtudiant_ProfesseurResponsable_Id(Long.parseLong(professeurId))
                .stream()
                .filter(candidature -> {
                    Stage stage = candidature.getStage();
                    return stage.getStartDate().getYear() == yearNumber;
                })
                .filter(candidature ->
                        ententeRepository.findByCandidatureId(candidature.getId()).map(
                        entente -> entente.getStatus() == EntenteStatus.SIGNEE
                ).orElse(false))
                .map(candidature -> {
                    Stage stage = candidature.getStage();
                    Employeur employeur = employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail());
                    return CandidatureEvaluationDTO.toDTO(candidature, employeur);
                })
                .toList();
    }

    @Transactional
    public List<EtudiantCandidaturesDTO> getAllEtudiantsCandidatures(String year, String professeurId, String callerEmail) {
        assertCallerIsProfesseur(callerEmail, professeurId);
        int yearNumber = SessionYearHelper.getSessionYear(year);
        List<Etudiant> etudiants = etudiantRepository.findAllByProfesseurResponsable_Id(Long.parseLong(professeurId));

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

        return etudiantCandidaturesDTO;
    }

    private void assertCallerIsProfesseur(String callerEmail, String professeurId) {
        if (callerEmail == null || professeurId == null) {
            throw new AccessDeniedException("Accès refusé");
        }
        Professeur caller = professeurRepository.findByCredentials_Username(callerEmail)
                .orElseThrow(() -> new AccessDeniedException("Accès refusé"));
        long parsedId;
        try {
            parsedId = Long.parseLong(professeurId);
        } catch (NumberFormatException e) {
            throw new AccessDeniedException("Accès refusé");
        }
        if (!caller.getId().equals(parsedId)) {
            throw new AccessDeniedException("Accès refusé");
        }
    }
}
