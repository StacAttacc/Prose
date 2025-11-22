package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.entente.Entente;
import com.AL565.prose.model.entente.EntenteStatus;
import com.AL565.prose.repository.*;
import com.AL565.prose.service.dto.EvaluationDTO;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvaluationServiceTest {

    @Mock
    private EvaluationRepository evaluationRepository;

    @Mock
    private EntenteRepository ententeRepository;

    @Mock
    private EmployeurRepository employeurRepository;


    @InjectMocks
    private EvaluationService evaluationService;

    private Employeur employeur;
    private Entente entente;
    private Evaluation evaluation;
    private EvaluationDTO evaluationDTO;

    @BeforeEach
    void setUp() {
        employeur = new Employeur();
        employeur.setId(1L);
        employeur.setFirstName("Entreprise");
        employeur.setLastName("Test");
        employeur.setCompany("Entreprise Test");

        Etudiant etudiant = new Etudiant();
        etudiant.setId(2L);
        etudiant.setLastName("Dupont");
        etudiant.setFirstName("Jean");

        Stage stage = Stage.builder()
                .id(3L)
                .title("Stage Développeur Java")
                .build();

        Candidature candidature = Candidature.builder()
                .id(4L)
                .etudiant(etudiant)
                .stage(stage)
                .status(CandidatureStatus.ACCEPTEE)
                .build();

        entente = Entente.builder()
                .id(5L)
                .candidature(candidature)
                .status(EntenteStatus.SIGNEE)
                .build();

        evaluation = Evaluation.builder()
                .id(6L)
                .entente(entente)
                .employeur(employeur)
                .etudiant(etudiant)
                .productivite(4)
                .qualiteTravail(5)
                .relationsInterpersonnelles(4)
                .habiletesPersonnelles(4)
                .appreciationGlobale(4)
                .commentaires("Très bon stagiaire")
                .pointsForts("Motivé et autonome")
                .pointsAmelioration("Peut améliorer la communication")
                .heureEncadrement("M. Martin")
                .gardeContact(true)
                .rehireEtudiant(true)
                .dateEvaluation(LocalDateTime.now())
                .dateCreation(LocalDateTime.now())
                .build();

        evaluationDTO = EvaluationDTO.builder()
                .ententeId(5L)
                .productivite(4)
                .qualiteTravail(5)
                .relationsInterpersonnelles(4)
                .habiletesPersonnelles(4)
                .appreciationGlobale(4)
                .commentaires("Très bon stagiaire")
                .pointsForts("Motivé et autonome")
                .pointsAmelioration("Peut améliorer la communication")
                .heureEncadrement("M. Martin")
                .gardeContact(true)
                .rehireEtudiant(true)
                .build();
    }

    @Test
    void testCreateEvaluation_Success() {
        when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));
        when(ententeRepository.findById(5L)).thenReturn(Optional.of(entente));
        when(evaluationRepository.existsByEntenteId(5L)).thenReturn(false);
        when(evaluationRepository.save(any(Evaluation.class))).thenReturn(evaluation);

        EvaluationDTO result = evaluationService.createEvaluation(1L, evaluationDTO);

        assertNotNull(result);
        assertEquals(4, result.getProductivite());
        assertEquals(5, result.getQualiteTravail());
        verify(evaluationRepository, times(1)).save(any(Evaluation.class));
    }

    @Test
    void testCreateEvaluation_EmployeurNotFound() {
        when(employeurRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () ->
            evaluationService.createEvaluation(1L, evaluationDTO)
        );
    }

    @Test
    void testCreateEvaluation_EntenteNotSigned() {
        entente.setStatus(EntenteStatus.A_SIGNER);
        when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));
        when(ententeRepository.findById(5L)).thenReturn(Optional.of(entente));

        assertThrows(IllegalStateException.class, () ->
            evaluationService.createEvaluation(1L, evaluationDTO)
        );
    }

    @Test
    void testCreateEvaluation_EvaluationAlreadyExists() {
        when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));
        when(ententeRepository.findById(5L)).thenReturn(Optional.of(entente));
        when(evaluationRepository.existsByEntenteId(5L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () ->
            evaluationService.createEvaluation(1L, evaluationDTO)
        );
    }

}