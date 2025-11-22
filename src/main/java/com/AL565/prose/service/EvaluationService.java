package com.AL565.prose.service;

import com.AL565.prose.model.Employeur;
import com.AL565.prose.model.Etudiant;
import com.AL565.prose.model.Evaluation;
import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.EvaluationDTO;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final EntenteRepository ententeRepository;
    private final EmployeurRepository employeurRepository;

    @Transactional
    public EvaluationDTO createEvaluation(Long employeurId, EvaluationDTO evaluationDTO) {
        Employeur employeur = employeurRepository.findById(employeurId)
                .orElseThrow(() -> new EntityNotFoundException("Employeur non trouvé avec l'ID: " + employeurId));

        Entente entente = ententeRepository.findById(evaluationDTO.getEntenteId())
                .orElseThrow(() -> new EntityNotFoundException("Entente non trouvée avec l'ID: " + evaluationDTO.getEntenteId()));

        if (entente.getStatus() != EntenteStatus.SIGNEE) {
            throw new IllegalStateException("L'entente doit être signée pour pouvoir évaluer le stagiaire");
        }

        if (evaluationRepository.existsByEntenteId(entente.getId())) {
            throw new IllegalStateException("Une évaluation existe déjà pour ce stage");
        }

        Etudiant etudiant = entente.getCandidature().getEtudiant();

        Evaluation evaluation = Evaluation.builder()
                .entente(entente)
                .employeur(employeur)
                .etudiant(etudiant)
                .productivite(evaluationDTO.getProductivite())
                .qualiteTravail(evaluationDTO.getQualiteTravail())
                .relationsInterpersonnelles(evaluationDTO.getRelationsInterpersonnelles())
                .habiletesPersonnelles(evaluationDTO.getHabiletesPersonnelles())
                .appreciationGlobale(evaluationDTO.getAppreciationGlobale())
                .commentaires(evaluationDTO.getCommentaires())
                .pointsForts(evaluationDTO.getPointsForts())
                .pointsAmelioration(evaluationDTO.getPointsAmelioration())
                .heureEncadrement(evaluationDTO.getHeureEncadrement())
                .gardeContact(evaluationDTO.getGardeContact())
                .rehireEtudiant(evaluationDTO.getRehireEtudiant())
                .dateEvaluation(evaluationDTO.getDateEvaluation() != null ? evaluationDTO.getDateEvaluation() : LocalDateTime.now())
                .dateCreation(LocalDateTime.now())
                .build();

        evaluation = evaluationRepository.save(evaluation);


        return EvaluationDTO.toDTO(evaluation);
    }


    @Transactional(readOnly = true)
    public EvaluationDTO getEvaluationByEntente(Long employeurId, Long ententeId) {
        Evaluation evaluation = evaluationRepository.findByEntenteId(ententeId)
                .orElseThrow(() -> new EntityNotFoundException("Aucune évaluation trouvée pour cette entente"));

        if (!evaluation.getEmployeur().getId().equals(employeurId)) {
            throw new IllegalStateException("Vous n'êtes pas autorisé à consulter cette évaluation");
        }

        return EvaluationDTO.toDTO(evaluation);
    }

    @Transactional(readOnly = true)
    public List<com.AL565.prose.service.dto.EntenteDTO> getEntentesForEvaluation(Long employeurId, String year) {
        Employeur employeur = employeurRepository.findById(employeurId)
                .orElseThrow(() -> new EntityNotFoundException("Employeur non trouvé avec l'ID: " + employeurId));

        int yearNumber = year != null ? Integer.parseInt(year) : java.time.LocalDate.now().getYear();

        List<Entente> ententes = ententeRepository.findAll().stream()
                .filter(e -> e.getStatus() == EntenteStatus.SIGNEE)
                .filter(e -> e.getCandidature().getStage().getEmployeurEmail() != null &&
                            e.getCandidature().getStage().getEmployeurEmail().equals(employeur.getCredentials().getUsername()))
                .filter(e -> e.getCandidature().getStage().getStartDate() != null &&
                            e.getCandidature().getStage().getStartDate().getYear() == yearNumber)
                .collect(Collectors.toList());

        return ententes.stream()
                .map(this::ententeToDTO)
                .collect(Collectors.toList());
    }

    private com.AL565.prose.service.dto.EntenteDTO ententeToDTO(Entente entente) {
        com.AL565.prose.service.dto.EntenteDTO dto = new com.AL565.prose.service.dto.EntenteDTO();
        dto.setId(entente.getId());
        dto.setEtudiantId(entente.getCandidature().getEtudiant().getId());
        dto.setEtudiantNom(entente.getCandidature().getEtudiant().getLastName());
        dto.setEtudiantPrenom(entente.getCandidature().getEtudiant().getFirstName());
        dto.setEmployeurId(entente.getCandidature().getStage().getId()); // Using stage ID as proxy
        dto.setStageId(entente.getCandidature().getStage().getId());
        dto.setStageTitle(entente.getCandidature().getStage().getTitle());
        dto.setStatus(entente.getStatus());

        boolean hasEvaluation = evaluationRepository.existsByEntenteId(entente.getId());
        dto.setHasEvaluation(hasEvaluation);

        return dto;
    }
}