package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.*;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.utils.SessionYearHelper;
import lombok.AllArgsConstructor;
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
    public void evaluateWorkplace(MillieuEvaluationDTO evaluation, long candidatureId) {
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new NoSuchElementException("Candidature non trouvée"));

        evaluation.setId(null);

        // S'assurer que les listes ne sont pas null
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
    public List<CandidatureEvaluationDTO> getAllCandidaturesProfesseurRelated(String year, String professeurId) {
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
    public List<EtudiantCandidaturesDTO> getAllEtudiantsCandidatures(String year, String professeurId) {
        int yearNumber = SessionYearHelper.getSessionYear(year);
        List<Etudiant> etudiants =  etudiantRepository.findAll();

        List <EtudiantCandidaturesDTO> etudiantCandidaturesDTO = new ArrayList<>();

        etudiants.forEach(etudiant -> {
            if (etudiant.getProfesseurResponsable() == null || !etudiant.getProfesseurResponsable().getId().equals(Long.parseLong(professeurId))) {
                return;
            }
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
                        .evaluationMillieu(candidature.getEvaluationMillieu() != null ?
                                MillieuEvaluationDTO.toDTO(candidature.getEvaluationMillieu()) : null)
                        .build();
            }).filter(candidature -> {
                StageSimpleDTO stage = candidature.getStage();
                LocalDate startDate = stage.getStartDate();
                return startDate.getYear() ==  yearNumber;
            }).toList();

            if(etudiantCandidature.isEmpty()){
                return;
            }

            etudiantCandidaturesDTO.add(
                    EtudiantCandidaturesDTO.builder()
                            .etudiant(EtudiantDTO.toDTOTokenless(etudiant))
                            .candidatures(etudiantCandidature)
                            .build()
            );
        });

        return etudiantCandidaturesDTO;
    }
}
