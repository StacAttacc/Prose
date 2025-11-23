package com.AL565.prose.service;

import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.Professeur;
import com.AL565.prose.model.Stage;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.CandidatureDTO;
import com.AL565.prose.service.dto.MillieuEvaluationDTO;
import com.AL565.prose.service.dto.ProfesseurPasswordDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.utils.SessionYearHelper;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ProfesseurService {
    private ProfesseurRepository professeurRepository;

    private PasswordEncoder passwordEncoder;

    private MillieuEvaluationRepository millieuEvaluationRepository;
    private CandidatureRepository candidatureRepository;

    public void register(ProfesseurPasswordDTO professeur) {
        if (professeurRepository.findByCredentials_Username(professeur.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Le professeur existe déja");
        }

        professeur.setPassword(passwordEncoder.encode(professeur.getPassword()));
        professeurRepository.save(ProfesseurPasswordDTO.toModel(professeur));
    }

    public void evaluateWorkplace(MillieuEvaluationDTO evaluation) {
        millieuEvaluationRepository.save(MillieuEvaluationDTO.toModel(evaluation));
    }

    public List<CandidatureDTO> getAllCandidaturesProfesseurRelated(String year, String professeurId) {
        int yearNumber = SessionYearHelper.getSessionYear(year);

        return candidatureRepository.findAllByEtudiant_ProfesseurResponsable_Id(Long.parseLong(professeurId))
                .stream()
                .filter(candidature -> {
                    Stage stage = candidature.getStage();
                    return stage.getStartDate().getYear() == yearNumber;
                })
                .map(CandidatureDTO::toDTO)
                .toList();
    }
}
