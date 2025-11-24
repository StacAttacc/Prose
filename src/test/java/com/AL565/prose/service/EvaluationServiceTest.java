package com.AL565.prose.service;

import com.AL565.prose.model.*;
import com.AL565.prose.model.auth.Credentials;
import com.AL565.prose.model.auth.Role;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
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

    @Mock
    private PasswordEncoder passwordEncoder;

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
        employeur.setCredentials(new Credentials(
            "employeur@test.com",
            "$2a$10$encodedPasswordHash", // Mock encoded password
            Role.EMPLOYEUR
        ));

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
                .nomEleve("Jean Dupont")
                .programmeEtudes("Informatique")
                .nomEntreprise("Entreprise Test")
                .nomSuperviseur("M. Martin")
                .fonction("Responsable TI")
                .telephone("514-555-1234")
                .productivitePlanificationOrganisation("totalementAccord")
                .productiviteComprendDirectives("totalementAccord")
                .productiviteMaintientRythme("totalementAccord")
                .productiviteEtablitPriorites("plutotAccord")
                .productiviteRespectEcheanciers("plutotAccord")
                .productiviteCommentaires("Très efficace")
                .qualiteRespectMandats("totalementAccord")
                .qualiteAttentionDetails("plutotAccord")
                .qualiteVerifieTravail("totalementAccord")
                .qualitePerfectionnement("plutotAccord")
                .qualiteAnalyseProblemes("plutotAccord")
                .qualiteCommentaires("Bon souci du détail")
                .relationsContactFacile("totalementAccord")
                .relationsTravailEquipe("totalementAccord")
                .relationsAdaptationCulture("plutotAccord")
                .relationsAccepteCritiques("totalementAccord")
                .relationsRespectueux("totalementAccord")
                .relationsEcouteActive("plutotAccord")
                .relationsCommentaires("Excellente collaboration")
                .habiletesInteretMotivation("totalementAccord")
                .habiletesExprimeIdees("plutotAccord")
                .habiletesInitiative("totalementAccord")
                .habiletesTravailSecuritaire("totalementAccord")
                .habiletesSensResponsabilites("plutotAccord")
                .habiletesPonctualiteAssiduite("totalementAccord")
                .habiletesCommentaires("Toujours ponctuel")
                .appreciationGlobale("depasse")
                .appreciationPrecisions("Performance remarquable")
                .evaluationDiscutee(true)
                .heuresEncadrement("2h/semaine")
                .accueillirProchainStage("oui")
                .formationSuffisante("Oui, formation adéquate")
                .signataireNom("M. Martin")
                .signataireFonction("Responsable TI")
                .signataireDate(java.time.LocalDate.now())
                .dateEvaluation(LocalDateTime.now())
                .dateCreation(LocalDateTime.now())
                .build();

        evaluationDTO = EvaluationDTO.builder()
                .ententeId(5L)
                .nomEleve("Jean Dupont")
                .programmeEtudes("Informatique")
                .nomEntreprise("Entreprise Test")
                .nomSuperviseur("M. Martin")
                .fonction("Responsable TI")
                .telephone("514-555-1234")
                .productivitePlanificationOrganisation("totalementAccord")
                .productiviteComprendDirectives("totalementAccord")
                .productiviteMaintientRythme("totalementAccord")
                .productiviteEtablitPriorites("plutotAccord")
                .productiviteRespectEcheanciers("plutotAccord")
                .productiviteCommentaires("Très efficace")
                .qualiteRespectMandats("totalementAccord")
                .qualiteAttentionDetails("plutotAccord")
                .qualiteVerifieTravail("totalementAccord")
                .qualitePerfectionnement("plutotAccord")
                .qualiteAnalyseProblemes("plutotAccord")
                .qualiteCommentaires("Bon souci du détail")
                .relationsContactFacile("totalementAccord")
                .relationsTravailEquipe("totalementAccord")
                .relationsAdaptationCulture("plutotAccord")
                .relationsAccepteCritiques("totalementAccord")
                .relationsRespectueux("totalementAccord")
                .relationsEcouteActive("plutotAccord")
                .relationsCommentaires("Excellente collaboration")
                .habiletesInteretMotivation("totalementAccord")
                .habiletesExprimeIdees("plutotAccord")
                .habiletesInitiative("totalementAccord")
                .habiletesTravailSecuritaire("totalementAccord")
                .habiletesSensResponsabilites("plutotAccord")
                .habiletesPonctualiteAssiduite("totalementAccord")
                .habiletesCommentaires("Toujours ponctuel")
                .appreciationGlobale("depasse")
                .appreciationPrecisions("Performance remarquable")
                .evaluationDiscutee(true)
                .heuresEncadrement("2h/semaine")
                .accueillirProchainStage("oui")
                .formationSuffisante("Oui, formation adéquate")
                .signataireNom("M. Martin")
                .signataireFonction("Responsable TI")
                .password("testPassword123") // Password for signature
                .build();
    }

    @Test
    void testCreateEvaluation_Success() {
        evaluationDTO.setPassword("testPassword123");

        when(employeurRepository.findById(1L)).thenReturn(Optional.of(employeur));
        when(ententeRepository.findById(5L)).thenReturn(Optional.of(entente));
        when(evaluationRepository.existsByEntenteId(5L)).thenReturn(false);
        when(passwordEncoder.matches("testPassword123", employeur.getPassword())).thenReturn(true);
        when(evaluationRepository.save(any(Evaluation.class))).thenReturn(evaluation);

        EvaluationDTO result = evaluationService.createEvaluation(1L, evaluationDTO);

        assertNotNull(result);
        assertEquals("totalementAccord", result.getProductivitePlanificationOrganisation());
        assertTrue(result.getEvaluationDiscutee());
        assertEquals("oui", result.getAccueillirProchainStage());
        verify(evaluationRepository, times(1)).save(any(Evaluation.class));
        verify(passwordEncoder, times(1)).matches("testPassword123", employeur.getPassword());
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