package com.AL565.prose.service;

import com.AL565.prose.repository.EmployeurRepository;
import com.AL565.prose.repository.MillieuEvaluationRepository;
import com.AL565.prose.repository.ProfesseurRepository;
import com.AL565.prose.repository.StageRepository;
import com.AL565.prose.service.dto.MillieuEvaluationDTO;
import com.AL565.prose.service.dto.ProfesseurPasswordDTO;
import com.AL565.prose.service.dto.StageDTO;
import com.AL565.prose.service.dto.StageSimpleDTO;
import com.AL565.prose.service.exceptions.EmailAlreadyExistsException;
import com.AL565.prose.utils.SessionYearHelper;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class ProfesseurService {
    private ProfesseurRepository professeurRepository;

    private PasswordEncoder passwordEncoder;

    private MillieuEvaluationRepository millieuEvaluationRepository;
    private StageRepository stageRepository;
    private EmployeurRepository employeurRepository;

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

    public List<StageSimpleDTO> getAllStagesAwaitingEvaluation(String year) {
        int yearNumber = SessionYearHelper.getSessionYear(year);

        return stageRepository.findAllByEvaluationMillieuIsNull().stream()
                .filter(stage -> stage.getStartDate().getYear() == yearNumber)
                .map(stage -> {
                    return StageSimpleDTO.toDTO(stage, employeurRepository.getEmployeurByCredentials_Username(stage.getEmployeurEmail()));
                })
                .toList();
    }
}
